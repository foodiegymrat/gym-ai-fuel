import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStepDetection } from "@/hooks/useStepDetection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Footprints, 
  RotateCcw, 
  Flame, 
  TrendingUp, 
  Activity,
  MapPin,
  AlertCircle,
  Settings,
  RefreshCw
} from "lucide-react";

interface AdvancedStepCounterProps {
  userId?: string;
  userWeight?: number;
  userHeight?: number;
}

export const AdvancedStepCounter = ({ 
  userId, 
  userWeight = 70, 
  userHeight = 170 
}: AdvancedStepCounterProps) => {
  const { toast } = useToast();
  const [dailyGoal] = useState(10000);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const {
    stepData,
    isTracking,
    permissionGranted,
    permissionStatus,
    permissionError,
    startTracking,
    stopTracking,
    resetSteps,
    checkPermissionStatus
  } = useStepDetection(userWeight, userHeight);

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const progress = (stepData.steps / dailyGoal) * 100;

  // Activity type color and label
  const getActivityStyle = () => {
    switch (stepData.activityType) {
      case 'running':
        return { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Running' };
      case 'jogging':
        return { color: 'text-accent', bg: 'bg-accent/10', label: 'Jogging' };
      case 'walking':
        return { color: 'text-primary', bg: 'bg-primary/10', label: 'Walking' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Idle' };
    }
  };

  const activityStyle = getActivityStyle();

  // Check permission and auto-start tracking on mount
  useEffect(() => {
    const initializeTracking = async () => {
      const status = await checkPermissionStatus();
      
      if (status === 'granted' || status === 'unavailable') {
        // Auto-start if permission already granted or on web
        await startTracking();
        setSessionStartTime(new Date());
      } else {
        // Show permission dialog if we need to request
        setShowPermissionDialog(true);
      }
    };

    initializeTracking();
  }, []);

  // Handle permission request
  const handleRequestPermission = async () => {
    setShowPermissionDialog(false);
    await startTracking();
    setSessionStartTime(new Date());
    
    if (!permissionGranted && permissionStatus === 'denied') {
      toast({
        title: "Permission Denied",
        description: "Please enable motion sensors in your device settings.",
        variant: "destructive"
      });
    }
  };

  // Get platform-specific instructions
  const getPlatformInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      return "Settings → Privacy & Security → Motion & Fitness → Enable for this app";
    } else if (isAndroid) {
      return "Settings → Apps → Permissions → Physical Activity → Allow";
    }
    return "Go to your device settings and enable motion sensor permissions for this app";
  };

  // Handle reset
  const handleReset = () => {
    resetSteps();
    toast({
      title: "Counter Reset",
      description: "Step counter has been reset to zero.",
    });
  };

  // Auto-save progress periodically when tracking
  useEffect(() => {
    if (!isTracking || !userId || stepData.steps === 0) return;

    const interval = setInterval(async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Upsert daily summary
        const { error } = await supabase
          .from('daily_summaries')
          .upsert({
            user_id: userId,
            summary_date: today,
            total_steps: stepData.steps,
            total_calories: stepData.calories,
            calories_burned: stepData.calories
          }, {
            onConflict: 'user_id,summary_date'
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error auto-saving progress:', error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [isTracking, userId, stepData]);

  return (
    <Card className="bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">AI Step Tracker</CardTitle>
        <Footprints className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Dialog */}
        {showPermissionDialog && (
          <Alert className="border-primary bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Motion Sensor Access Needed</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm">
                To track your steps accurately, this app needs access to your device's motion sensors.
              </p>
              <Button 
                onClick={handleRequestPermission}
                className="w-full mt-2"
                size="sm"
              >
                Grant Permission
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Error Alert */}
        {permissionStatus === 'denied' && permissionError && !showPermissionDialog && (
          <Alert variant="destructive">
            <Settings className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p className="text-sm">{permissionError}</p>
              <div className="bg-destructive/10 p-3 rounded text-xs space-y-1">
                <p className="font-semibold">To enable:</p>
                <p>{getPlatformInstructions()}</p>
              </div>
              <Button 
                onClick={handleRequestPermission}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Web Development Notice */}
        {permissionStatus === 'unavailable' && (
          <Alert className="border-muted-foreground/20 bg-muted/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Development Mode</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              Using simulated step data. Deploy to a mobile device for real motion tracking.
            </AlertDescription>
          </Alert>
        )}
        {/* Main step count */}
        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-foreground">
              {stepData.steps.toLocaleString()}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${activityStyle.bg} ${activityStyle.color}`}>
              {activityStyle.label}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Goal: {dailyGoal.toLocaleString()} steps
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress.toFixed(1)}% of daily goal
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">Distance</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {(stepData.distance / 1000).toFixed(2)} km
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Flame className="h-3 w-3" />
              <span className="text-xs">Calories</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {Math.round(stepData.calories)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span className="text-xs">Pace</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {Math.round(stepData.pace)}/min
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-end">
          <Button 
            onClick={handleReset} 
            variant="outline"
            size="sm"
            disabled={isTracking && stepData.steps === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>


        {/* Battery optimization tip */}
        {isTracking && (
          <div className="text-xs text-primary bg-primary/10 p-2 rounded flex items-start gap-2">
            <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <p>AI algorithm optimized for battery efficiency</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
