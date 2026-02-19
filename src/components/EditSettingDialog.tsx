import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

type Setting = Tables<"settings">;

type ValueType = "boolean" | "string" | "number";

type FormValues = {
  value: string;
};

interface EditSettingDialogProps {
  setting: Setting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditSettingDialog({
  setting,
  open,
  onOpenChange,
  onSaved,
}: EditSettingDialogProps) {
  const form = useForm<FormValues>({ defaultValues: { value: "" } });

  useEffect(() => {
    if (setting && open) {
      form.reset({ value: setting.value });
    }
  }, [setting, open, form]);

  const valueType: ValueType | undefined = setting?.value_type;
  const isBoolean = valueType === "boolean";
  const isNumber = valueType === "number";

  const onSubmit = async (values: FormValues) => {
    if (!setting) return;
    const raw = values.value;
    const value =
      valueType === "boolean"
        ? raw === "true"
          ? "true"
          : "false"
        : valueType === "number"
          ? String(Number(raw) ?? 0)
          : raw;

    const { error } = await supabase
      .from("settings")
      .update({ value })
      .eq("id", setting.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Setting updated");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit setting</DialogTitle>
        </DialogHeader>
        {setting && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-muted-foreground">{setting.name}</p>
              {isBoolean && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="bool-true" />
                            <Label htmlFor="bool-true">True</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="bool-false" />
                            <Label htmlFor="bool-false">False</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {valueType === "string" && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {isNumber && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
