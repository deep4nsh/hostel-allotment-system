"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProfile, updateProfile, requestEditAccess, calculateDistance } from "@/lib/api";
import { Lock } from "lucide-react";
import { State, City, Country } from 'country-state-city';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { POSTAL_CODE_REGEX, DEFAULT_POSTAL_CODE_REGEX } from "@/lib/constants/postal-codes";

const formSchema = z.object({
  uniqueId: z.string().min(1, "Roll Number / Application No. is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().default("India"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  category: z.enum(["DELHI", "OUTSIDE_DELHI", "PH", "NRI"]),
  program: z.string().min(1, "Program is required"),
  year: z.coerce.number().min(1).max(5),
  cgpa: z.coerce.number().min(0).max(10).optional().default(0),
  distance: z.coerce.number().min(0).optional().default(0),
  roomTypePreference: z.string().optional(),
}).superRefine((data, ctx) => {
  const country = data.country || "India";
  const regex = POSTAL_CODE_REGEX[country] || DEFAULT_POSTAL_CODE_REGEX;

  if (!regex.test(data.pincode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid postal code format for ${country}`,
      path: ["pincode"],
    });
  }
});

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [isRequestingEdit, setIsRequestingEdit] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("IN");

  type ProfileFormValues = z.infer<typeof formSchema>;

  // Using any here to resolve a type mismatch between Zod's inferred input type (unknown/any due to coerce)
  // and the strict type expected by useForm. The validation is still handled correctly by the resolver.
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uniqueId: "",
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      gender: "MALE",
      category: "DELHI",
      program: "",
      year: 1,
      cgpa: 0,
      distance: 0,
      roomTypePreference: "",
      floorPreference: "",
    },
  });

  // Watch the year to conditionally show fields
  const selectedYear = form.watch("year");
  const selectedProgram = form.watch("program");
  const selectedState = form.watch("state");
  const currentCategory = form.watch("category");

  // Fetch states based on countryCode
  const states = State.getStatesOfCountry(countryCode);

  // Fetch cities based on selected state and countryCode
  // Note: City.getCitiesOfState requires ISO code of country and ISO code of state.
  // We store state NAME in the DB, so we need to find the ISO code from the name.
  const stateIso = states.find(s => s.name === selectedState)?.isoCode || '';
  const cities = selectedState && stateIso
    ? City.getCitiesOfState(countryCode, stateIso)
    : [];

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        if (profile) {
          setIsFrozen(profile.isProfileFrozen);
          // Extract meta fields
          const meta = profile.profileMeta as any || {};

          const countryName = profile.country || "India";
          // Find country code
          const foundCountry = Country.getAllCountries().find(c => c.name === countryName);
          const cCode = foundCountry ? foundCountry.isoCode : "IN";
          setCountryCode(cCode);

          // Logic: If Not India -> Category is NRI
          let category = profile.category || "DELHI";
          if (countryName !== "India") {
            category = "NRI";
          }

          form.reset({
            uniqueId: profile.uniqueId || "",
            name: profile.name || "",
            phone: profile.phone || "",
            addressLine1: profile.addressLine1 || "",
            addressLine2: profile.addressLine2 || "",
            city: profile.city || "",
            state: profile.state || "",
            pincode: profile.pincode || "",
            country: countryName,
            gender: profile.gender || "MALE",
            category: category,
            program: profile.program || "BTECH",
            year: profile.year || 1,
            cgpa: profile.cgpa || 0, // Now using top-level cgpa
            distance: meta.distance || 0,
            roomTypePreference: profile.roomTypePreference || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    setMessage(null);
    try {
      const updatedProfile = await updateProfile(values);
      setMessage({ text: "Profile updated successfully", type: "success" });
      if (updatedProfile.isProfileFrozen) {
        setIsFrozen(true);
        setMessage({ text: "Profile updated and frozen. Request edit access to make changes.", type: "success" });
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRequestEdit() {
    if (!editReason.trim()) {
      alert("Please provide a reason.");
      return;
    }
    setIsRequestingEdit(true);
    try {
      await requestEditAccess(editReason);
      alert("Edit request submitted successfully. An admin will review it shortly.");
      setIsDialogOpen(false);
      setEditReason("");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsRequestingEdit(false);
    }
  }

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <Form {...form}>
      <div className="flex justify-end mb-4 gap-2">

        {isFrozen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                <Lock className="w-4 h-4" />
                Request Edit Access
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Profile Edit Access</DialogTitle>
                <DialogDescription>
                  Your profile is currently frozen. Please provide a reason for why you need to edit your details.
                  An admin will review your request.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason for change</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Correction in address, Updated phone number..."
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleRequestEdit} disabled={isRequestingEdit}>
                  {isRequestingEdit ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {message && (
          <div className={`p-3 text-sm rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        <fieldset disabled={isFrozen} className="space-y-6 disabled:opacity-70">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isFrozen} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)} disabled={isFrozen}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                      <SelectItem value="5">5th Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} disabled={isFrozen} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFrozen}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="program"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFrozen}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BTECH">B.Tech</SelectItem>
                      <SelectItem value="MTECH">M.Tech</SelectItem>
                      <SelectItem value="MBA">MBA</SelectItem>
                      <SelectItem value="MSC">M.Sc</SelectItem>
                      <SelectItem value="PHD">Ph.D</SelectItem>
                      <SelectItem value="BDES">B.Des</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uniqueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedYear === 1 ? "Application Number" : "Roll Number"} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={selectedYear === 1 ? "e.g. 524123456" : "e.g. 2K24/A1/123"}
                      {...field}
                      disabled={isFrozen}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isFrozen || countryCode !== "IN"} // Automatically disabled if not India
                    value={countryCode !== "IN" ? "NRI" : field.value} // Force NRI if not India
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DELHI">Delhi</SelectItem>
                      <SelectItem value="OUTSIDE_DELHI">Outside Delhi</SelectItem>
                      <SelectItem value="PH">PWD / PH</SelectItem>
                      <SelectItem value="NRI">NRI / DASA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance (km)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        // Disable if already frozen OR if NRI
                        disabled={isFrozen || currentCategory === 'NRI' || countryCode !== 'IN'}
                        value={(currentCategory === 'NRI' || countryCode !== 'IN') ? 0 : field.value}
                      />
                    </FormControl>
                    {countryCode === 'IN' && (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isFrozen}
                        onClick={async () => {
                          const address = {
                            addressLine1: form.getValues("addressLine1"),
                            city: form.getValues("city"),
                            state: form.getValues("state"),
                            pincode: form.getValues("pincode"),
                          };
                          if (!address.addressLine1 || !address.city || !address.state || !address.pincode) {
                            alert("Please fill in all address fields first.");
                            return;
                          }
                          try {
                            const res = await calculateDistance(address);
                            form.setValue("distance", res.distance);
                            alert(`Calculated Distance: ${res.distance} km`);
                          } catch (e) {
                            alert("Failed to calculate distance. Please try again.");
                          }
                        }}
                      >
                        Calculate
                      </Button>
                    )}
                  </div>
                  <FormDescription>
                    {(currentCategory === 'NRI' || countryCode !== 'IN')
                      ? "Not applicable for NRI/International students."
                      : "Approx. distance from DTU. Will be verified."
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {selectedYear > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGPA / Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" max={10} placeholder="0.00" {...field} disabled={isFrozen} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedYear >= 2 && form.watch("cgpa") >= 8.0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Merit Preferences</h3>
                <p className="text-xs text-blue-700 mb-4">
                  Since your CGPA is 8.0+, you are eligible to express room and floor preferences.
                  Note: Allotment is subject to availability.
                </p>
              </div>
              <FormField
                control={form.control}
                name="roomTypePreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFrozen}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(() => {
                          const bachelors = ['BTECH', 'BSC', 'BDES', 'IMSC'];
                          const masters = ['MTECH', 'MSC', 'MCA', 'MBA', 'MDES'];

                          const isMaster = masters.includes(selectedProgram);
                          const isBachelor = bachelors.includes(selectedProgram);
                          const yr = Number(selectedYear);

                          let options = [
                            { value: "SINGLE", label: "Single Seater" },
                            { value: "DOUBLE", label: "Double Seater" },
                            { value: "TRIPLE", label: "Triple Seater" },
                            { value: "TRIPLE_AC", label: "Triple Seater (AC)" },
                          ];

                          if (isMaster) {
                            // Masters: Single, Double
                            options = [
                              { value: "SINGLE", label: "Single Seater" },
                              { value: "DOUBLE", label: "Double Seater" }
                            ];
                          } else if (isBachelor) {
                            if (yr === 2) {
                              // "2nd year students- AC triple, triple and double"
                              options = [
                                { value: "TRIPLE_AC", label: "Triple Seater (AC)" },
                                { value: "TRIPLE", label: "Triple Seater" },
                                { value: "DOUBLE", label: "Double Seater" }
                              ];
                            } else if (yr === 3) {
                              // "3rd year students- ac triple, double and single"
                              options = [
                                { value: "TRIPLE_AC", label: "Triple Seater (AC)" },
                                { value: "DOUBLE", label: "Double Seater" },
                                { value: "SINGLE", label: "Single Seater" }
                              ];
                            } else if (yr === 4 || yr === 5) {
                              // "4th year students- double, single and ac triple"
                              options = [
                                { value: "DOUBLE", label: "Double Seater" },
                                { value: "SINGLE", label: "Single Seater" },
                                { value: "TRIPLE_AC", label: "Triple Seater (AC)" }
                              ];
                            }
                          }

                          return options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 (House No., Street) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="H.No 123, Street Name" {...field} disabled={isFrozen} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Locality, Landmark)</FormLabel>
                  <FormControl>
                    <Input placeholder="Locality, Landmark" {...field} disabled={isFrozen} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!cities.length || isFrozen}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={cities.length ? "Select city" : "Select state first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("city", ""); // Reset city when state changes
                    }}
                    defaultValue={field.value}
                    disabled={isFrozen}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="110042" {...field} disabled={isFrozen} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="India" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        {!isFrozen && (
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save & Freeze Profile"}
          </Button>
        )}
      </form>
    </Form>
  );
}
