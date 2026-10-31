// src/features/admin/utils/dataMapper.js
/**
 * Auto-mapping and column matching logic with confidence scoring.
 */

function cleanStr(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Calculates string similarity between 0 and 1 using Levenshtein distance
 */
function stringSimilarity(s1, s2) {
  const a = cleanStr(s1);
  const b = cleanStr(s2);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(a.length, b.length);
  return 1 - matrix[a.length][b.length] / maxLen;
}

/**
 * Computes best schema field match for a given file header
 * Returns { targetKey, confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE', score }
 */
export function matchHeaderToField(header, schemaFields) {
  const cleanHeader = cleanStr(header);
  let bestMatch = null;
  let highestScore = 0;

  for (const field of schemaFields) {
    // 1. Exact match on field.key or field.label
    if (cleanHeader === cleanStr(field.key) || cleanHeader === cleanStr(field.label)) {
      return { targetKey: field.key, confidence: 'HIGH', score: 1.0 };
    }

    // 2. Exact match on any synonym
    if (field.synonyms) {
      for (const syn of field.synonyms) {
        if (cleanHeader === cleanStr(syn)) {
          return { targetKey: field.key, confidence: 'HIGH', score: 0.98 };
        }
      }
    }

    // 3. Substring match
    if (field.synonyms) {
      for (const syn of field.synonyms) {
        const cleanSyn = cleanStr(syn);
        if (cleanHeader.includes(cleanSyn) || cleanSyn.includes(cleanHeader)) {
          if (0.85 > highestScore) {
            highestScore = 0.85;
            bestMatch = field.key;
          }
        }
      }
    }

    // 4. Fuzzy Levenshtein match
    const simKey = stringSimilarity(header, field.key);
    const simLabel = stringSimilarity(header, field.label);
    const maxSim = Math.max(simKey, simLabel);

    if (maxSim > highestScore) {
      highestScore = maxSim;
      bestMatch = field.key;
    }
  }

  if (highestScore >= 0.8) {
    return { targetKey: bestMatch, confidence: 'HIGH', score: highestScore };
  }
  if (highestScore >= 0.55) {
    return { targetKey: bestMatch, confidence: 'MEDIUM', score: highestScore };
  }
  if (highestScore >= 0.4) {
    return { targetKey: bestMatch, confidence: 'LOW', score: highestScore };
  }

  return { targetKey: '__IGNORE__', confidence: 'NONE', score: 0 };
}

/**
 * Generates initial field mapping for an uploaded file's headers against the schema
 */
export function autoMapHeaders(headers, schemaFields, savedMapping = null) {
  const mapping = {}; // { sourceHeader: { targetKey, confidence, score } }
  const assignedTargets = new Set();

  // First check if savedMapping has valid match
  if (savedMapping) {
    for (const h of headers) {
      if (savedMapping[h] && schemaFields.some((f) => f.key === savedMapping[h])) {
        mapping[h] = {
          targetKey: savedMapping[h],
          confidence: 'HIGH',
          score: 1.0,
        };
        if (savedMapping[h] !== '__IGNORE__') {
          assignedTargets.add(savedMapping[h]);
        }
      }
    }
  }

  // Map remaining unmapped headers
  for (const h of headers) {
    if (mapping[h]) continue;

    // Filter available schema fields that aren't assigned yet (or allow all)
    const availableFields = schemaFields.filter((f) => !assignedTargets.has(f.key));
    const match = matchHeaderToField(h, availableFields.length ? availableFields : schemaFields);

    if (match.targetKey && match.targetKey !== '__IGNORE__' && match.confidence !== 'NONE') {
      mapping[h] = match;
      assignedTargets.add(match.targetKey);
    } else {
      mapping[h] = { targetKey: '__IGNORE__', confidence: 'NONE', score: 0 };
    }
  }

  return mapping;
}

/**
 * Creates live preview rows by mapping raw file data rows through the current mapping dictionary
 */
export function mapRawRows(rawRows, mapping, schema) {
  return rawRows.map((rawRow, idx) => {
    const mapped = { __rawRowIndex: idx + 1 };
    Object.entries(mapping).forEach(([sourceHeader, mapInfo]) => {
      const targetKey = typeof mapInfo === 'string' ? mapInfo : mapInfo?.targetKey;
      if (targetKey && targetKey !== '__IGNORE__') {
        const fieldDef = schema.fields.find((f) => f.key === targetKey);
        const rawVal = rawRow[sourceHeader];
        mapped[targetKey] = fieldDef?.normalise ? fieldDef.normalise(rawVal) : rawVal;
      }
    });
    return mapped;
  });
}

