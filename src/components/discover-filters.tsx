
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

type FiltersShape = { cause: string; state: string; verifiedOnly: boolean };

type DiscoverFiltersProps = {
  causes?: string[];
  states?: string[];
  currentFilters?: FiltersShape;
  filters?: FiltersShape;
  onFilterChange?: (filters: FiltersShape) => void;
  onFiltersChange?: (filters: FiltersShape) => void;
  availableCauses?: string[];
  availableStates?: string[];
};

export default function DiscoverFilters(props: DiscoverFiltersProps) {
  const {
    causes,
    states,
    currentFilters,
    filters,
    onFilterChange,
    onFiltersChange,
    availableCauses,
    availableStates,
  } = props;

  const current = currentFilters ?? filters ?? { cause: 'all', state: 'all', verifiedOnly: false };
  const causesList = causes ?? availableCauses ?? [];
  const statesList = states ?? availableStates ?? [];
  const onChange = onFilterChange ?? onFiltersChange ?? (() => {});

  const handleCauseChange = (newCause: string) => {
    onChange({ ...current, cause: newCause });
  };

  const handleStateChange = (newState: string) => {
    onChange({ ...current, state: newState });
  };

  const handleVerifiedToggle = (checked: boolean) => {
    onChange({ ...current, verifiedOnly: checked });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <label htmlFor="cause-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filter by Cause
          </label>
          <Select value={current.cause} onValueChange={handleCauseChange}>
            <SelectTrigger id="cause-filter" className="h-12 w-full rounded-xl bg-background">
              <SelectValue placeholder="All Causes" />
            </SelectTrigger>
            <SelectContent>
              {causesList.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === 'all' ? 'All Causes' : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <label htmlFor="state-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filter by State
          </label>
          <Select value={current.state} onValueChange={handleStateChange}>
            <SelectTrigger id="state-filter" className="h-12 w-full rounded-xl bg-background">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              {statesList.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All States' : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex h-12 items-center gap-3 rounded-xl border bg-background px-4">
          <Switch id="verified-toggle" checked={current.verifiedOnly} onCheckedChange={handleVerifiedToggle} />
          <Label htmlFor="verified-toggle" className="cursor-pointer text-sm font-semibold">
            Show verified only
          </Label>
        </div>
      </div>
    </div>
  );
}
