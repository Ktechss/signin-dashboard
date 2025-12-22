import { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function SubNavigation({
  title,
  description,
  items = [],
  activeItem,
  onItemSelect,
  onBack,
  backLabel = 'Back',
  className,
}) {
  const [expandedItems, setExpandedItems] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleExpand = (id) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleItemClick = (item) => {
    if (item.children) {
      toggleExpand(item.id);
    } else {
      onItemSelect?.(item.id);
      if (isMobile) setMobileOpen(false);
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 mb-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>
      )}

      {/* Title */}
      {title && (
        <div className="px-3 mb-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeItem === item.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {item.icon && (
                <item.icon className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="flex-1 text-left">{item.label}</span>
              {item.children && (
                expandedItems.includes(item.id)
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />
              )}
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>

            {/* Children */}
            {item.children && expandedItems.includes(item.id) && (
              <div className="ml-8 mt-1 space-y-1 mb-2">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      onItemSelect?.(child.id);
                      if (isMobile) setMobileOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      activeItem === child.id
                        ? "text-slate-900 font-medium bg-slate-100"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  // Mobile: Show as sheet
  if (isMobile) {
    const activeLabel = items.find(i => i.id === activeItem)?.label || 'Menu';

    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-between mb-4">
            <span>{activeLabel}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-4">
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Show as sidebar
  return (
    <div className={cn("w-56 flex-shrink-0", className)}>
      <NavContent />
    </div>
  );
}
