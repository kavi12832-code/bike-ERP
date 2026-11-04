import '@testing-library/jest-dom';
import { useAppStore } from '../store';
import { getInitialSeedData } from '../data/seed';

// The app loads its data from the API; unit tests run without a backend, so give the store the demo data.
useAppStore.setState(getInitialSeedData());
