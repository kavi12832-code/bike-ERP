import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import {
  Search,
  User,
  FileSpreadsheet,
  BookmarkCheck,
  FileText,
  Bike,
  Wrench,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export function GlobalSearchInput() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const leads = useAppStore((state) => state.leads || []);
  const quotations = useAppStore((state) => state.quotations || []);
  const bookings = useAppStore((state) => state.bookings || []);
  const invoices = useAppStore((state) => state.invoices || []);
  const vehicleStock = useAppStore((state) => state.vehicleStock || []);
  const jobCards = useAppStore((state) => state.jobCards || []);

  // Listen for Ctrl+K to focus input
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute grouped matches
  const groupedResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const leadMatches = leads
      .filter(
        (l) =>
          l.customerName?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.leadNumber?.toLowerCase().includes(q) ||
          l.modelOfInterest?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((l) => ({
        id: `lead-${l.id}`,
        category: 'Leads',
        icon: User,
        title: l.customerName || 'Lead',
        subtitle: `${l.leadNumber || ''} • ${l.modelOfInterest || 'Inquiry'} • ${l.status || ''}`,
        link: `/leads?search=${encodeURIComponent(l.customerName || l.phone || '')}`,
      }));

    const quotationMatches = quotations
      .filter(
        (quot) =>
          quot.quotationNumber?.toLowerCase().includes(q) ||
          quot.customerName?.toLowerCase().includes(q) ||
          quot.modelName?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((quot) => ({
        id: `quot-${quot.id}`,
        category: 'Quotations',
        icon: FileSpreadsheet,
        title: quot.quotationNumber || 'Quotation',
        subtitle: `${quot.customerName || ''} • ${quot.modelName || ''} • ₹${(
          (quot.onRoadPricePaise || 0) / 100
        ).toLocaleString('en-IN')}`,
        link: `/quotations?id=${quot.id}`,
      }));

    const bookingMatches = bookings
      .filter(
        (b) =>
          b.bookingNumber?.toLowerCase().includes(q) ||
          b.customerName?.toLowerCase().includes(q) ||
          b.modelName?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((b) => ({
        id: `booking-${b.id}`,
        category: 'Bookings',
        icon: BookmarkCheck,
        title: b.bookingNumber || 'Booking',
        subtitle: `${b.customerName || ''} • ${b.modelName || ''} • Token: ₹${(
          (b.bookingAmountPaise || 0) / 100
        ).toLocaleString('en-IN')}`,
        link: `/bookings?id=${b.id}`,
      }));

    const invoiceMatches = invoices
      .filter(
        (inv) =>
          inv.invoiceNumber?.toLowerCase().includes(q) ||
          inv.customerName?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((inv) => ({
        id: `inv-${inv.id}`,
        category: 'Invoices',
        icon: FileText,
        title: inv.invoiceNumber || 'Tax Invoice',
        subtitle: `${inv.customerName || ''} • ₹${(
          (inv.grandTotalPaise || 0) / 100
        ).toLocaleString('en-IN')} • ${inv.status || ''}`,
        link: `/billing?search=${encodeURIComponent(inv.invoiceNumber)}`,
      }));

    const vehicleMatches = vehicleStock
      .filter(
        (v) =>
          v.chassisNumber?.toLowerCase().includes(q) ||
          v.vin?.toLowerCase().includes(q) ||
          v.modelName?.toLowerCase().includes(q) ||
          v.registrationNumber?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((v) => ({
        id: `veh-${v.id || v.chassisNumber}`,
        category: 'Vehicles / VIN',
        icon: Bike,
        title: `${v.modelName || 'Vehicle'} (${v.colorName || 'Standard'})`,
        subtitle: `VIN: ${v.chassisNumber || v.vin} • Status: ${v.status}`,
        link: `/stock/vehicles?search=${encodeURIComponent(v.chassisNumber || '')}`,
      }));

    const jobMatches = jobCards
      .filter(
        (jc) =>
          jc.jobCardNumber?.toLowerCase().includes(q) ||
          jc.customerName?.toLowerCase().includes(q) ||
          jc.regNumber?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((jc) => ({
        id: `jc-${jc.id}`,
        category: 'Jobs',
        icon: Wrench,
        title: jc.jobCardNumber || 'Job Card',
        subtitle: `${jc.regNumber || ''} • ${jc.customerName || ''} • ${jc.stage || jc.status}`,
        link: `/service/job-cards?id=${jc.id}`,
      }));

    const groups = [];
    if (leadMatches.length > 0) groups.push({ name: 'Leads', items: leadMatches });
    if (quotationMatches.length > 0) groups.push({ name: 'Quotations', items: quotationMatches });
    if (bookingMatches.length > 0) groups.push({ name: 'Bookings', items: bookingMatches });
    if (invoiceMatches.length > 0) groups.push({ name: 'Invoices', items: invoiceMatches });
    if (vehicleMatches.length > 0) groups.push({ name: 'Vehicles / VIN', items: vehicleMatches });
    if (jobMatches.length > 0) groups.push({ name: 'Jobs', items: jobMatches });

    return groups;
  }, [query, leads, quotations, bookings, invoices, vehicleStock, jobCards]);

  // Flattened for keyboard navigation
  const flatItems = useMemo(() => {
    return groupedResults.flatMap((g) => g.items);
  }, [groupedResults]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    navigate(item.link);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        handleSelect(flatItems[selectedIndex]);
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search leads, VIN, jobs, invoices..."
          className="w-full h-9 pl-9 pr-14 text-xs bg-surface-subtle border border-border rounded-input text-text-main placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          aria-label="Global search across Leads, VIN, Jobs, and Invoices"
          aria-expanded={isOpen}
          role="combobox"
          aria-autocomplete="list"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 text-text-muted hover:text-text-main rounded"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-2.5 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] font-mono text-text-muted shadow-xs pointer-events-none">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Grouped Results Dropdown Popover */}
      {isOpen && query.trim().length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1.5 bg-surface rounded-card border border-border shadow-dialog z-50 overflow-hidden max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
        >
          {flatItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-muted">
              No matching records found for "{query}"
            </div>
          ) : (
            groupedResults.map((group) => (
              <div key={group.name} className="border-b border-border/60 last:border-b-0">
                <div className="px-3 py-1.5 bg-surface-subtle/70 text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                  <span>{group.name}</span>
                  <span className="text-[9px] bg-border/60 px-1.5 py-0.2 rounded font-mono">
                    {group.items.length}
                  </span>
                </div>
                <div>
                  {group.items.map((item) => {
                    const globalIdx = flatItems.findIndex((fi) => fi.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`px-3 py-2 flex items-center justify-between cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-subtle text-text-main'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-1.5 rounded-md ${
                              isSelected ? 'bg-primary text-white' : 'bg-surface-subtle text-text-muted'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{item.title}</div>
                            <div className="text-[10px] text-text-muted truncate">{item.subtitle}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0 ml-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearchInput;

