import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { schools } from "@/data/schools";
import { countries } from "@/data/countries";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

const adminFormSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  firstName: z.string().trim().min(1, "Required").max(50),
  lastName: z.string().trim().min(1, "Required").max(50),
  phoneNumber: z.string().trim().min(1, "Required").max(20),
  age: z.string().min(1, "Required"),
  tshirtSize: z.string().min(1, "Required"),
  school: z.string().trim().min(1, "Required").max(100),
  schoolOther: z.string().trim().max(100).optional(),
  levelOfStudy: z.string().min(1, "Required"),
  countryOfResidence: z.string().min(1, "Required"),
  countryOther: z.string().trim().max(100).optional(),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergiesDetail: z.string().trim().max(500).optional(),
  otherAccommodations: z.string().trim().max(500).optional(),
  additionalNotes: z.string().trim().max(1000).optional(),
  airportTransportation: z.enum(["yes", "no", "maybe"]),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

const defaultValues: AdminFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  age: "",
  tshirtSize: "",
  school: "",
  schoolOther: "",
  levelOfStudy: "",
  countryOfResidence: "",
  countryOther: "",
  dietaryRestrictions: [],
  allergiesDetail: "",
  otherAccommodations: "",
  additionalNotes: "",
  airportTransportation: "no",
};

interface AdminRegisterDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AdminRegisterDialog({ onSuccess, trigger }: AdminRegisterDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues,
  });

  const school = form.watch("school");
  const countryOfResidence = form.watch("countryOfResidence");

  const onSubmit = async (data: AdminFormValues) => {
    setSubmitting(true);
    try {
      const schoolVal = data.school === "Other" && data.schoolOther ? data.schoolOther : data.school;
      const countryVal =
        data.countryOfResidence === "Other" && data.countryOther
          ? data.countryOther
          : data.countryOfResidence;

      const { error } = await supabase.from("registrations").insert({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        age: parseInt(data.age, 10),
        tshirt_size: data.tshirtSize,
        school: schoolVal,
        school_other: data.school === "Other" ? data.schoolOther : null,
        level_of_study: data.levelOfStudy,
        country_of_residence: countryVal,
        country_other: data.countryOfResidence === "Other" ? data.countryOther : null,
        dietary_restrictions: data.dietaryRestrictions?.length ? data.dietaryRestrictions : null,
        allergies_detail: data.allergiesDetail || null,
        other_accommodations: data.otherAccommodations || null,
        additional_notes: data.additionalNotes || null,
        airport_transportation: data.airportTransportation,
        resume_url: null,
        mlh_code_of_conduct: false,
        mlh_event_logistics: false,
        mlh_marketing: false,
        discord_joined: false,
        parental_consent: null,
      });

      if (error) throw error;
      toast.success("Registration added.");
      form.reset(defaultValues);
      setOpen(false);
      onSuccess?.();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to add registration.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Register a Hacker
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border">
          <DialogTitle className="text-xl text-primary">Add registration</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pb-6 flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name *</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 555 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
                      <FormControl>
                        <Input type="number" min={13} max={100} placeholder="18" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tshirtSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>T-shirt size *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["xs", "s", "m", "l", "xl", "xxl"].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School *</FormLabel>
                    <FormControl>
                      <Combobox
                        options={schools}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select or search school"
                        searchPlaceholder="Search..."
                        emptyText="No school found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {school === "Other" && (
                <FormField
                  control={form.control}
                  name="schoolOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School name</FormLabel>
                      <FormControl>
                        <Input placeholder="Specify school" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="levelOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level of study *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="undergraduate-freshman">Undergraduate – Freshman</SelectItem>
                        <SelectItem value="undergraduate-sophomore">Undergraduate – Sophomore</SelectItem>
                        <SelectItem value="undergraduate-junior">Undergraduate – Junior</SelectItem>
                        <SelectItem value="undergraduate-senior">Undergraduate – Senior</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countryOfResidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country of residence *</FormLabel>
                    <FormControl>
                      <Combobox
                        options={countries}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select or search country"
                        searchPlaceholder="Search..."
                        emptyText="No country found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {countryOfResidence === "Other" && (
                <FormField
                  control={form.control}
                  name="countryOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Specify country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="airportTransportation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airport transportation *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="maybe" />
                          </FormControl>
                          <FormLabel className="font-normal">Maybe</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Dietary (optional)</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {["vegetarian", "vegan", "gluten-free", "halal", "none", "other"].map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="dietaryRestrictions"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) =>
                                checked
                                  ? field.onChange([...(field.value ?? []), item])
                                  : field.onChange(field.value?.filter((v) => v !== item) ?? [])
                              }
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {item === "gluten-free" ? "Gluten-free" : item}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="allergiesDetail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Allergies or dietary notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherAccommodations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other accommodations (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Any other needs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Internal or other notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    "Add registration"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
