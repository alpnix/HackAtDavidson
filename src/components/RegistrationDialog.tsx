import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RegistrationForm from "./RegistrationForm";

interface RegistrationDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RegistrationDialog = ({ trigger, open, onOpenChange }: RegistrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">Register Now</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-primary">Register for Hack@Davidson 2026</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto overscroll-contain px-6 pb-6 max-h-[calc(90vh-100px)]">
          <RegistrationForm onSuccess={() => onOpenChange?.(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationDialog;
