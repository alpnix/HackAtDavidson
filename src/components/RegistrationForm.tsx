import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { schools } from "@/data/schools";
import { countries } from "@/data/countries";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/FileUpload";
import { REGISTRATIONS_CLOSED } from "@/lib/constants";

const formSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  phoneNumber: z.string().trim().min(1, "Phone number is required").max(20, "Phone number must be less than 20 characters"),
  age: z.string().min(1, "Age is required"),
  tshirtSize: z.string().min(1, "T-shirt size is required"),
  school: z.string().trim().min(1, "School is required").max(100, "School name must be less than 100 characters"),
  schoolOther: z.string().trim().max(100).optional(),
  levelOfStudy: z.string().min(1, "Level of study is required"),
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  countryOther: z.string().trim().max(100).optional(),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergiesDetail: z.string().trim().max(500).optional(),
  otherAccommodations: z.string().trim().max(500).optional(),
  airportTransportation: z.string().min(1, "Please select a transportation option"),
  housingAcknowledgement: z.boolean().refine((val) => val === true, "You must acknowledge this information"),
  resume: z.instanceof(File).optional().nullable(),
  mlhCodeOfConduct: z.boolean().refine((val) => val === true, "You must agree to the MLH Code of Conduct"),
  mlhEventLogistics: z.boolean().refine((val) => val === true, "You must agree to the MLH Event Logistics policy"),
  mlhMarketing: z.boolean().optional(),
  discordJoined: z.boolean().refine((val) => val === true, "Please confirm you've joined the Discord"),
  additionalNotes: z.string().trim().max(1000).optional(),
  parentalConsent: z.boolean().optional(),
}).refine((data) => {
  const ageNum = parseInt(data.age);
  if (ageNum < 18) {
    return data.parentalConsent === true;
  }
  return true;
}, {
  message: "Parental consent is required for participants under 18",
  path: ["parentalConsent"],
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  onSuccess?: () => void;
}

const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      airportTransportation: "",
      housingAcknowledgement: false,
      mlhCodeOfConduct: false,
      mlhEventLogistics: false,
      mlhMarketing: false,
      discordJoined: false,
      additionalNotes: "",
      parentalConsent: false,
    },
  });

  const age = form.watch("age");
  const isUnder18 = age ? parseInt(age) < 18 : false;
  const school = form.watch("school");
  const countryOfResidence = form.watch("countryOfResidence");
  const dietaryRestrictions = form.watch("dietaryRestrictions");

  const onSubmit = async (data: FormValues) => {
    if (REGISTRATIONS_CLOSED) {
      toast.error("Registration is closed.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      let resumeUrl: string | null = null;

      // Upload resume to Supabase Storage if provided
      if (data.resume) {
        const fileExt = data.resume.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${data.email}/${fileName}`;

        console.log('Uploading resume:', { fileName, filePath, fileSize: data.resume.size });

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('resumes')
          .upload(filePath, data.resume, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Resume upload failed: ${uploadError.message}`);
        }

        console.log('Upload successful:', uploadData);
        // Get the public URL (even though bucket is private, we store the path)
        resumeUrl = filePath;
      }

      // Insert registration data into database
      const { error: dbError } = await supabase
        .from("registrations")
        .insert({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          age: parseInt(data.age),
          tshirt_size: data.tshirtSize,
          school: data.school,
          school_other: data.schoolOther,
          level_of_study: data.levelOfStudy,
          country_of_residence: data.countryOfResidence,
          country_other: data.countryOther,
          dietary_restrictions: data.dietaryRestrictions,
          allergies_detail: data.allergiesDetail,
          other_accommodations: data.otherAccommodations,
          airport_transportation: data.airportTransportation,
          resume_url: resumeUrl,
          mlh_code_of_conduct: data.mlhCodeOfConduct,
          mlh_event_logistics: data.mlhEventLogistics,
          mlh_marketing: data.mlhMarketing,
          discord_joined: data.discordJoined,
          additional_notes: data.additionalNotes,
          parental_consent: data.parentalConsent,
        });

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke(
        "send-registration-confirmation",
        {
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          },
        }
      );

      if (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the registration if email fails
      }

      toast.success("Registration submitted!", {
        description: "Check your email for confirmation details. See you in February!",
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: error.message || "Please try again or contact hack@davidson.edu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {REGISTRATIONS_CLOSED && (
          <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            Registration is currently closed.
          </p>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age *</FormLabel>
                <FormControl>
                  <Input type="number" min="13" max="100" placeholder="18" {...field} />
                </FormControl>
                <FormDescription>
                  Participants under 18 must be accompanied by a parent or guardian.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tshirtSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>T-shirt Size *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="xs">XS</SelectItem>
                    <SelectItem value="s">S</SelectItem>
                    <SelectItem value="m">M</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                    <SelectItem value="xxl">XXL</SelectItem>
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
                  placeholder="Select or search your school"
                  searchPlaceholder="Search schools..."
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
                <FormLabel>Please specify your school</FormLabel>
                <FormControl>
                  <Input placeholder="Your school name" {...field} />
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
              <FormLabel>Level of Study *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="undergraduate-freshman">Undergraduate - Freshman</SelectItem>
                  <SelectItem value="undergraduate-sophomore">Undergraduate - Sophomore</SelectItem>
                  <SelectItem value="undergraduate-junior">Undergraduate - Junior</SelectItem>
                  <SelectItem value="undergraduate-senior">Undergraduate - Senior</SelectItem>
                  <SelectItem value="graduate">Graduate Student</SelectItem>
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
              <FormLabel>Country of Residence *</FormLabel>
              <FormControl>
                <Combobox
                  options={countries}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select or search your country"
                  searchPlaceholder="Search countries..."
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
                <FormLabel>Please specify your country</FormLabel>
                <FormControl>
                  <Input placeholder="Your country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Dietary Restrictions</FormLabel>
              </div>
              <div className="space-y-3">
                {["vegetarian", "vegan", "gluten-free", "halal", "allergies", "none", "other"].map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="dietaryRestrictions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {item === "gluten-free" ? "Gluten-free" : item}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {dietaryRestrictions?.includes("allergies") && (
          <FormField
            control={form.control}
            name="allergiesDetail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>If you selected allergies, what allergies do you have?</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please list your allergies..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="otherAccommodations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you need any other accommodations? Please specify.</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any accessibility needs or special accommodations..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="airportTransportation"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Do you need transportation to and from the airport? *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Yes
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      No
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="maybe" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Maybe
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="housingAcknowledgement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-card/50">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormDescription>
                  Hack@Davidson is unable to provide housing accommodations, but the venue will be open 24/7 if you need to rest. We are working to create a partial travel reimbursement plan. Please reach out at hack@davidson.edu if you have any questions. *
                </FormDescription>
                <FormLabel>
                  I acknowledge
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resume"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Resume (Optional)</FormLabel>
              <FormControl>
                <FileUpload
                  value={value}
                  onChange={onChange}
                  accept=".pdf,.doc,.docx"
                  maxSize={5 * 1024 * 1024}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Upload your resume in PDF, DOC, or DOCX format (Max 5MB). By submitting a resume, you consent to sharing it with Hack@Davidson affiliates and sponsors.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border-t pt-6">
          <FormField
            control={form.control}
            name="mlhCodeOfConduct"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    MLH Code of Conduct *
                  </FormLabel>
                  <FormDescription>
                    Be respectful. Harassment and abuse are never tolerated. If you are in a situation that makes you uncomfortable at an MLH Member Event, if the event itself is creating an unsafe or inappropriate environment, or if interacting with a MLH representative or event organizer makes you uncomfortable, please report it using the procedures included in this document.{" "}
                    <a href="https://mlh.io/code-of-conduct" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Click here for the full document.
                    </a>
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mlhEventLogistics"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    MLH Event Logistics *
                  </FormLabel>
                  <FormDescription>
                    I authorize Hack@Davidson to share my application/registration information with Major League Hacking for event administration, ranking, and MLH administration in-line with the{" "}
                    <a href="https://mlh.io/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      MLH Privacy Policy
                    </a>
                    . I further agree to the terms of both the{" "}
                    <a href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      MLH Contest Terms and Conditions
                    </a>{" "}
                    and the{" "}
                    <a href="https://mlh.io/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      MLH Privacy Policy
                    </a>
                    .
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mlhMarketing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>MLH Marketing and Newsletters (optional)</FormLabel>
                  <FormDescription>
                    I authorize MLH to send me an email where I can further opt into the MLH Hacker, Events, or Organizer Newsletters and other communications from MLH.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discordJoined"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Join our discord at{" "}
                    <a href="https://discord.gg/DsxPGRqFuS" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      https://discord.gg/DsxPGRqFuS
                    </a>{" "}
                    *
                  </FormLabel>
                  <FormDescription>
                    I joined!
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>If you want us to know anything please put it here</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information you'd like to share..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isUnder18 && (
          <FormField
            control={form.control}
            name="parentalConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-card/50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Parental Consent *
                  </FormLabel>
                  <FormDescription>
                    I confirm that I am a parent or guardian and I consent to this participant's attendance at Hack@Davidson.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )}

        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isSubmitting || REGISTRATIONS_CLOSED}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : REGISTRATIONS_CLOSED ? (
            "Registration Closed"
          ) : (
            "Submit Registration"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;
