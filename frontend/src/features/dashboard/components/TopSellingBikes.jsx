import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { BikeThumb } from '../../../components/domain/BikeThumb';
import { useAppStore } from '../../../store';
import { formatMoney } from '../../../lib/format';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export function TopSellingBikes() {
  const navigate = useNavigate();
  const catalog = useAppStore((state) => state.catalogs?.bikes || []);

  // Top fast movers from the catalogue (Admin-maintained, loaded from the database)
  const topBikes = catalog.filter((b) => b.fastMover).slice(0, 5);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Top Selling Models</CardTitle>
          <p className="text-xs text-text-muted mt-0.5">High velocity showroom favorites</p>
        </div>
        <button
          onClick={() => navigate('/stock/vehicles')}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Inventory</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </CardHeader>

      <CardContent className="divide-y divide-border/60 p-0">
        {topBikes.map((bike) => (
          <div
            key={bike.id}
            onClick={() => navigate('/quotations')}
            className="p-4 flex items-center justify-between hover:bg-surface-subtle transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-11 bg-surface-muted rounded-button p-1 flex items-center justify-center shrink-0 border border-border/40">
                <BikeThumb
                  bodyType={bike.bodyType}
                  color={bike.colors[0]?.hex || '#2563EB'}
                  imageUrl={bike.imageUrl}
                  className="w-14 h-9"
                />
              </div>
              <h4 className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">
                {bike.brand} {bike.model}
              </h4>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-text-main tabular-nums">
                {formatMoney(bike.exShowroomPaise)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
