import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stages = [
  {
    name: "New Leads",
    deals: [
      { id: 1, client: "Acme Corp", value: "$5,000", probability: 20 },
      { id: 2, client: "TechStart Inc", value: "$12,000", probability: 25 },
    ]
  },
  {
    name: "Qualified",
    deals: [
      { id: 3, client: "Global Solutions", value: "$8,500", probability: 50 },
      { id: 4, client: "Innovation Labs", value: "$15,000", probability: 60 },
    ]
  },
  {
    name: "Proposal",
    deals: [
      { id: 5, client: "Enterprise Co", value: "$25,000", probability: 75 },
    ]
  },
  {
    name: "Negotiation",
    deals: [
      { id: 6, client: "Future Tech", value: "$18,000", probability: 85 },
    ]
  },
  {
    name: "Closed Won",
    deals: [
      { id: 7, client: "Success Corp", value: "$22,000", probability: 100 },
    ]
  }
];

const Pipeline = () => {
  const getTotalValue = (deals: any[]) => 
    deals.reduce((sum, deal) => sum + parseInt(deal.value.replace('$', '').replace(',', '')), 0);

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "bg-green-500";
    if (probability >= 60) return "bg-blue-500";
    if (probability >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Pipeline</h1>
        <p className="text-muted-foreground">
          Track your deals through each stage of the sales process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage, index) => (
          <Card key={index} className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
              <CardDescription>
                ${getTotalValue(stage.deals).toLocaleString()} total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stage.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3 bg-background border rounded-lg space-y-2"
                >
                  <div className="font-medium text-sm">{deal.client}</div>
                  <div className="text-lg font-bold">{deal.value}</div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`h-2 w-2 rounded-full ${getProbabilityColor(deal.probability)}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {deal.probability}% probability
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Summary</CardTitle>
          <CardDescription>Overview of your sales pipeline performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${stages.reduce((total, stage) => total + getTotalValue(stage.deals), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Pipeline Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stages.reduce((total, stage) => total + stage.deals.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Active Deals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${getTotalValue(stages.find(s => s.name === "Closed Won")?.deals || []).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Won This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">73%</div>
              <div className="text-sm text-muted-foreground">Average Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pipeline;