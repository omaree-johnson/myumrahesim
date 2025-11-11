# Select Component - Usage Guide

## Overview
The Select component is a Radix UI-based dropdown select menu that allows users to pick from a list of options. It's been integrated into the Umrah eSIM app for filtering eSIM plans by duration.

## Installation
The component requires the following dependency:
```bash
pnpm add @radix-ui/react-select
```

## Component Location
- **Select UI Component**: `src/components/ui/select.tsx`
- **Usage Example**: `src/components/home-page-client.tsx`

## Basic Usage

### Import the component
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
```

### Basic Example
```tsx
<Select value={selectedValue} onValueChange={setSelectedValue}>
  <SelectTrigger className="w-52">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

## Implementation in Umrah eSIM App

### Duration Filter (Home Page)
The Select component is used to filter eSIM plans by duration. Users can:
- Select "All durations" to show all plans
- Select a specific number of days (e.g., "7 days", "10 days")
- Select "Unlimited Data" to filter for unlimited plans only

### Code Example from `home-page-client.tsx`
```tsx
const [selectedDuration, setSelectedDuration] = useState<string>("all");

// Filter products based on selected duration
const filteredProducts = selectedDuration === "all" 
  ? products 
  : selectedDuration === "unlimited"
  ? products.filter(p => p.dataUnlimited)
  : products.filter(p => p.durationDays?.toString() === selectedDuration);

// Render the select component
<Select value={selectedDuration} onValueChange={setSelectedDuration}>
  <SelectTrigger className="w-52">
    <SelectValue placeholder="Select duration" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All durations</SelectItem>
    {uniqueDurations.map(days => (
      <SelectItem key={days} value={days.toString()}>
        {days} day{days !== 1 ? 's' : ''}
      </SelectItem>
    ))}
    {hasUnlimited && (
      <SelectItem value="unlimited">Unlimited Data</SelectItem>
    )}
  </SelectContent>
</Select>
```

## Component Props

### Select (Root)
- `value`: Current selected value (controlled)
- `onValueChange`: Callback when selection changes
- `defaultValue`: Initial value (uncontrolled)
- `disabled`: Disable the entire select

### SelectTrigger
- `className`: Custom CSS classes (Tailwind)
- Standard button props

### SelectValue
- `placeholder`: Text shown when no value is selected

### SelectContent
- `position`: "popper" | "item-aligned" (default: "popper")
- `className`: Custom CSS classes

### SelectItem
- `value`: The value for this option (required)
- `disabled`: Disable this specific option
- `className`: Custom CSS classes

## Styling

### Default Styles
- **Trigger**: White background, gray border, rounded-lg, sky-blue focus ring
- **Content**: White background, gray border, shadow-md, max-height 96 (24rem)
- **Item**: Sky-100 background on focus/hover, check icon for selected item
- **Animations**: Fade and zoom in/out, slide from respective sides

### Customizing Width
```tsx
<SelectTrigger className="w-52">  {/* 200px */}
<SelectTrigger className="w-64">  {/* 256px */}
<SelectTrigger className="w-full"> {/* 100% */}
```

## Accessibility Features
- Keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader support via ARIA attributes
- Focus management
- Disabled state support

## Advanced Features

### Scrollable Select
The component automatically handles scrolling when there are many options:
```tsx
<SelectContent>
  {manyOptions.map(option => (
    <SelectItem key={option.id} value={option.id}>
      {option.label}
    </SelectItem>
  ))}
</SelectContent>
```

### With Clear Button
```tsx
{selectedValue !== "default" && (
  <button
    onClick={() => setSelectedValue("default")}
    className="px-3 py-2 text-sm text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50"
  >
    Clear Filter
  </button>
)}
```

### Empty State
```tsx
{filteredData.length === 0 ? (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
    <p className="text-blue-800">No items match your filters.</p>
  </div>
) : (
  <DataList data={filteredData} />
)}
```

## Common Patterns

### Form Integration
```tsx
<form onSubmit={handleSubmit}>
  <label>Select Duration</label>
  <Select value={duration} onValueChange={setDuration}>
    <SelectTrigger>
      <SelectValue placeholder="Choose duration" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="7">7 days</SelectItem>
      <SelectItem value="14">14 days</SelectItem>
      <SelectItem value="30">30 days</SelectItem>
    </SelectContent>
  </Select>
</form>
```

### With Labels
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Duration</label>
  <Select value={value} onValueChange={setValue}>
    {/* ... */}
  </Select>
</div>
```

### Multiple Filters
```tsx
<div className="flex gap-3">
  <Select value={duration} onValueChange={setDuration}>
    {/* Duration options */}
  </Select>
  
  <Select value={dataType} onValueChange={setDataType}>
    {/* Data type options */}
  </Select>
</div>
```

## Troubleshooting

### Select not opening
- Ensure `SelectContent` is inside the same `Select` component
- Check for CSS conflicts (z-index issues)
- Verify Radix UI Portal is rendering correctly

### Value not updating
- Make sure you're using controlled mode: `value` + `onValueChange`
- Or uncontrolled mode: `defaultValue` only (not both)

### Styling issues
- Check that Tailwind CSS is processing the component file
- Verify `cn()` utility is properly merging classes
- Use browser DevTools to inspect actual rendered classes

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- Requires JavaScript enabled

## Resources
- [Radix UI Select Documentation](https://www.radix-ui.com/docs/primitives/components/select)
- [shadcn/ui Select Component](https://ui.shadcn.com/docs/components/select)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Related Components
- **Badge**: For displaying selected filter tags
- **Button**: For clear/reset filter actions
- **Input**: Alternative for text-based filtering

## Future Enhancements
- [ ] Add multi-select capability
- [ ] Add search/filter within select options
- [ ] Add grouped options (SelectGroup, SelectLabel)
- [ ] Add loading state indicator
- [ ] Add custom icons for different options
