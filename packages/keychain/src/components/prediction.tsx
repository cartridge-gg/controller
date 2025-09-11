import {
  Button,
  Card,
  CardContent,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";

export function Prediction() {
  return (
    <>
      <HeaderInner title="Prediction" />
      <LayoutContent>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Prediction Feature</h2>
              <p className="text-gray-600 mb-6">
                This is a placeholder for the prediction feature. Future
                functionality will be implemented here.
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-500">
                  Coming soon: Advanced prediction capabilities
                </p>
              </div>
              <Button variant="outline" onClick={() => window.close()}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </LayoutContent>
      <LayoutFooter />
    </>
  );
}
