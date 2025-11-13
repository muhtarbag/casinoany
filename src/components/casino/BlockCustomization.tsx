import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, FileText, Gamepad2, LogIn, Wallet, HelpCircle, 
  CheckCircle, Star, Award, Trophy, Zap, Target 
} from "lucide-react";

const availableIcons = {
  shield: Shield,
  fileText: FileText,
  gamepad: Gamepad2,
  login: LogIn,
  wallet: Wallet,
  help: HelpCircle,
  check: CheckCircle,
  star: Star,
  award: Award,
  trophy: Trophy,
  zap: Zap,
  target: Target,
};

interface BlockCustomizationProps {
  blockName: string;
  iconName: string;
  iconColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

export const BlockCustomization = ({
  blockName,
  iconName,
  iconColor,
  onIconChange,
  onColorChange,
}: BlockCustomizationProps) => {
  const IconComponent = availableIcons[iconName as keyof typeof availableIcons] || Shield;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-sm">
          {blockName} - Görsel Özelleştirme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>İkon</Label>
            <Select value={iconName} onValueChange={onIconChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(availableIcons).map(([key, Icon]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {key}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Renk</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={iconColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={iconColor}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-center p-4 border rounded-lg bg-muted/30">
            <IconComponent 
              className="w-8 h-8" 
              style={{ color: iconColor }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { availableIcons };
