# Mobile Responsive Quick Reference Guide

## Quick Copy-Paste Patterns

### Container & Layout

```jsx
// Main Container
<div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">

// Section Container
<div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">

// Flex Header
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
```

### Typography

```jsx
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
<h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
<h3 className="text-base sm:text-lg font-semibold">
<h4 className="text-sm sm:text-base lg:text-lg font-medium">
<p className="text-sm sm:text-base">
<p className="text-xs sm:text-sm">
<span className="text-[10px] sm:text-xs">
```

### Icons

```jsx
// Header Icons
<Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />

// Stats Card Icons
<Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />

// Button Icons
<Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
```

### Grids

```jsx
// Stats Grid (4 columns)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

// Charts Grid (2 columns)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

// Form Grid (3 columns)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

// Card Grid (Flexible)
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
```

### Cards

```jsx
// Stat Card
<div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 border-l-4 border-blue-500">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Label</p>
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Value</p>
    </div>
    <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500 opacity-20" />
  </div>
</div>

// Content Card
<div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Title</h3>
  <div className="space-y-3 sm:space-y-4">
    {/* Content */}
  </div>
</div>
```

### Buttons

```jsx
// Primary Button
<button className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors">

// Secondary Button
<button className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">

// Icon Button with Text
<button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 active:bg-blue-800">
  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
  <span className="hidden sm:inline">Button Text</span>
</button>

// Button Group (Stack on Mobile)
<div className="flex flex-col sm:flex-row gap-2">
  <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 ...">Button 1</button>
  <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 ...">Button 2</button>
</div>
```

### Forms

```jsx
// Form Container
<form className="space-y-4 sm:space-y-6">
  {/* Form Field */}
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      Label
    </label>
    <input
      type="text"
      className="w-full px-3 sm:px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  {/* Form Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    {/* Fields */}
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 active:bg-blue-800"
  >
    Submit
  </button>
</form>
```

### Tables

```jsx
// Table Container
<div className="bg-white rounded-lg shadow overflow-hidden">
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full min-w-[700px]">
      {/* Table Header */}
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
            Header
          </th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody className="divide-y divide-gray-200">
        <tr className="hover:bg-gray-50">
          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
            Cell Content
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t">
    <div className="flex-1 flex justify-between gap-2 sm:hidden">
      <button className="px-3 py-2 border text-xs rounded-md">Previous</button>
      <span className="flex items-center text-xs text-gray-600">1 / 5</span>
      <button className="px-3 py-2 border text-xs rounded-md">Next</button>
    </div>
    <div className="hidden sm:flex sm:items-center sm:justify-between sm:flex-1">
      {/* Desktop pagination */}
    </div>
  </div>
</div>
```

### Charts

```jsx
// Chart Container
<div className="bg-white rounded-lg shadow p-4 sm:p-6">
  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
    Chart Title
  </h3>
  <ResponsiveContainer width="100%" height={220} className="sm:h-[250px]">
    <BarChart data={data}>{/* Chart components */}</BarChart>
  </ResponsiveContainer>
</div>
```

### Filters

```jsx
// Filter Section
<div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {/* Search Input */}
    <div className="sm:col-span-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {/* Select Filter */}
    <select className="border rounded-lg px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500">
      <option>All</option>
    </select>
  </div>
</div>
```

### Modals

```jsx
// Modal Container
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg max-w-sm sm:max-w-md lg:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    {/* Modal Header */}
    <div className="flex items-center justify-between p-4 sm:p-6 border-b">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold">
        Modal Title
      </h3>
      <button className="p-1 hover:bg-gray-100 rounded-lg active:bg-gray-200">
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>

    {/* Modal Content */}
    <div className="p-4 sm:p-6 space-y-4">{/* Content */}</div>

    {/* Modal Footer */}
    <div className="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 border-t">
      <button className="flex-1 sm:flex-none px-4 py-2 border rounded-lg">
        Cancel
      </button>
      <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Badges & Status

```jsx
// Status Badge
<span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
  <span className="hidden sm:inline">Status Text</span>
  <span className="sm:hidden">S</span>
</span>
```

### Progress Bars

```jsx
// Progress Bar
<div>
  <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2">
    <span>Progress Label</span>
    <span className="font-semibold">75%</span>
  </div>
  <div className="bg-gray-200 rounded-full h-1.5 sm:h-2">
    <div
      className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all"
      style={{ width: "75%" }}
    ></div>
  </div>
</div>
```

### Loading States

```jsx
// Loading Spinner
<div className="flex items-center justify-center h-screen">
  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
</div>

// Loading Text
<div className="text-center">
  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading...</p>
</div>
```

### Empty States

```jsx
// Empty State
<div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
  <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
    No items found
  </h3>
  <p className="text-sm sm:text-base text-gray-500">
    Try adjusting your filters
  </p>
</div>
```

## Common Mistakes to Avoid

❌ **Don't:**

- Use only `md:` breakpoint (skips tablets)
- Forget touch states (`active:`)
- Use fixed widths without responsive variants
- Ignore horizontal scroll on tables
- Use hover-only features

✅ **Do:**

- Use `sm:` and `lg:` for most layouts
- Add `active:` states to all clickable elements
- Use `w-full sm:w-auto` for responsive widths
- Add `-mx-4 sm:mx-0` for mobile full-width tables
- Ensure all features work with tap/touch

## Testing Checklist

- [ ] Test on 360px width (small Android)
- [ ] Test on 375px width (iPhone SE)
- [ ] Test on 768px width (iPad)
- [ ] Test on 1024px+ (Desktop)
- [ ] All text is readable without zooming
- [ ] All buttons are at least 44x44px
- [ ] Tables scroll horizontally on mobile
- [ ] Forms stack properly on mobile
- [ ] Modals don't overflow viewport
- [ ] Loading states are responsive
- [ ] Empty states look good on mobile

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Pro Tip:** When in doubt, start with mobile layout (default classes) and add breakpoints as needed. This is true mobile-first design!
