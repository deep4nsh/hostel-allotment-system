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
import { getProfile, updateProfile } from "@/lib/api";

const formSchema = z.object({
  uniqueId: z.string().min(1, "Roll Number / Application No. is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  category: z.enum(["DELHI", "OUTSIDE_DELHI", "PH", "NRI"]),
  program: z.string().min(1, "Program is required"),
  year: z.coerce.number().min(1).max(5),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  distance: z.coerce.number().min(0).optional(),
});

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        uniqueId: "",
        name: "",
        phone: "",
        address: "",
        program: "",
        year: 1,
        cgpa: 0,
        distance: 0,
    },
  });

  // Watch the year to conditionally show fields
  const selectedYear = form.watch("year");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        if (profile) {
          // Extract meta fields
          const meta = profile.profileMeta as any || {};
          
          form.reset({
            uniqueId: profile.uniqueId || "",
            name: profile.name || "",
            phone: profile.phone || "",
            address: profile.address || "",
            gender: profile.gender || "MALE",
            category: profile.category || "DELHI",
            program: profile.program || "B.Tech",
            year: profile.year || 1,
            cgpa: meta.cgpa || 0,
            distance: meta.distance || 0,
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
      await updateProfile(values);
      setMessage({ text: "Profile updated successfully", type: "success" });
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
      return <div>Loading profile...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {message && (
          <div className={`p-3 text-sm rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

             <FormField
            control={form.control}
            name="uniqueId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Roll No. / Application No.</FormLabel>
                <FormControl>
                    <Input placeholder="2K24/..." {...field} />
                </FormControl>
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
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="9876543210" {...field} />
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
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormLabel>Program</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="M.Tech">M.Tech</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="M.Sc">M.Sc</SelectItem>
                    <SelectItem value="Ph.D">Ph.D</SelectItem>
                    <SelectItem value="B.Des">B.Des</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Year</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
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
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormDescription>Approx. distance from DTU. Will be verified.</FormDescription>
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
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
             </div>
         )}
       
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permanent Address</FormLabel>
              <FormControl>
                <Input placeholder="Full address as per documents" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}
