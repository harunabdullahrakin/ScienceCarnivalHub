import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { registrationFormSchema, RegistrationFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { toast } = useToast();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      participantType: "student",
      grade: "none", // Changed from empty string to "none"
      activities: [],
      specialRequests: "",
      acceptTerms: false
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const res = await apiRequest("POST", "/api/register-carnival", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for the Science Carnival!",
      });
      setRegistrationSuccess(true);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "There was a problem with your registration.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-montserrat font-bold">Register for the Science Carnival</h1>
            <p className="mt-2 text-xl">Join us for an exciting day of scientific discovery!</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
            <p className="text-gray-600 mb-6">Thank you for registering for the TGHBHS Science Carnival. We look forward to seeing you there!</p>
            <p className="font-medium mb-8">An email confirmation has been sent to your provided email address.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/">Return to Home</a>
              </Button>
              <Button variant="outline">
                <a href="/wiki">Explore Science Wiki</a>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold">Register for the Science Carnival</h1>
          <p className="mt-2 text-xl">Join us for an exciting day of scientific discovery!</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Participant Information</h2>
            <p className="text-gray-600">Please fill out the form below to register for the Science Carnival.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="participantType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participant Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select participant type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="parent">Parent/Guardian</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level (if student)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not Applicable</SelectItem>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="activities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Interested Activities</FormLabel>
                      <FormDescription>Select all that apply</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["experiments", "presentations", "competitions", "workshops"].map((activity) => (
                        <FormField
                          key={activity}
                          control={form.control}
                          name="activities"
                          render={({ field }) => {
                            return (
                              <FormItem key={activity} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(activity)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), activity])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== activity
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {activity.charAt(0).toUpperCase() + activity.slice(1)}
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

              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests or Accommodations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Let us know if you have any special requirements..."
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
                name="acceptTerms"
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
                        I agree to the <a href="#" className="text-primary-600 hover:underline">terms and conditions</a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
