import { useState } from 'react';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formSchema } from '@/lib/schema';
import { SelectItems } from './SelectItems';
import saveData from './api/google-sheets';
import { z } from 'zod';
import { MatrixEffect } from './components/MatrixEffect';

type FormValues = z.infer<typeof formSchema>;

export default function App() {
  const [teamMemberCount, setTeamMemberCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: '',
      fullName: '',
      rollNo: '',
      email: '',
      branch: '',
      teamMembers: [],
    },
  });

  useEffect(() => {
    const createCircuitLines = () => {
      const container = document.querySelector('.circuit-decoration');
      if (!container) return;
      
      // Clear any existing elements
      container.innerHTML = '';

      // Create more elements for better coverage
      for (let i = 0; i < 25; i++) {
        // Create circuits
        const line = document.createElement('div');
        line.className = 'circuit-line';
        line.style.left = `${Math.random() * 100}%`;
        line.style.top = `${Math.random() * 100}%`;
        line.style.width = `${100 + Math.random() * 200}px`; // Longer lines
        line.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(line);

        // Create dots at ends
        const dot = document.createElement('div');
        dot.className = 'circuit-dot';
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        container.appendChild(dot);

        // Create vines with varied sizes
        const vine = document.createElement('div');
        vine.className = 'vine';
        vine.style.left = `${Math.random() * 100}%`;
        vine.style.top = `${Math.random() * 100}%`;
        vine.style.width = `${50 + Math.random() * 150}px`;
        vine.style.height = `${50 + Math.random() * 150}px`;
        vine.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(vine);
      }
    };

    createCircuitLines();
  }, []);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const cleanedData = {
        ...data,
        teamMembers: data.teamMembers.filter((member) => member !== undefined),
        teamName: data.teamName,
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/save-to-sheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: cleanedData }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      toast.success('Form submitted successfully!');
      form.reset();
      setTeamMemberCount(0);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const addTeamMember = () => {
    if (teamMemberCount < 2) {
      setTeamMemberCount(prev => prev + 1);
      const currentTeamMembers = form.getValues('teamMembers') || [];
      form.setValue('teamMembers', [...currentTeamMembers, { fullName: '', rollNo: '', email: '', branch: '' }]);
    }
  };

  const removeTeamMember = () => {
    if (teamMemberCount > 0) {
      setTeamMemberCount(prev => prev - 1);
      const currentTeamMembers = form.getValues('teamMembers');
      form.setValue('teamMembers', currentTeamMembers.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <Card className="bg-[#1a1a1a] border-[#333] shadow-2xl rounded-3xl">
          <CardHeader className="space-y-2 border-b border-[#333] bg-gradient-to-r from-[#00ff80]/10 to-[#1d8a54]/10 rounded-t-3xl">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#00ff80] to-[#1d8a54] bg-clip-text text-transparent">
              Registration Form
            </CardTitle>
            <CardDescription className="text-gray-400">
              Fill in your details to register. You can participate solo or add up to 2 team members.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="teamName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Team Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={typeof field.value === 'string' ? field.value : ''}
                            placeholder="Enter team name"
                            className="bg-[#222] border-[#333] text-white placeholder:text-gray-500 rounded-lg"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {Object.keys(formSchema.shape).filter(key => key !== 'teamMembers' && key !== 'teamName').map((fieldName) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName as keyof Omit<FormValues, 'teamMembers' | 'teamName'>}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </FormLabel>
                          <FormControl>
                            {fieldName === 'branch' ? (
                              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                <FormControl>
                                  <SelectTrigger className="bg-[#222] border-[#333] text-white rounded-lg">
                                    <SelectValue placeholder={`Select ${fieldName}`} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#222] border-[#333] text-white rounded-lg">
                                  <SelectItems />
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                {...field}
                                value={typeof field.value === 'string' ? field.value : ''}
                                placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                className="bg-[#222] border-[#333] text-white placeholder:text-gray-500 rounded-lg"
                              />
                            )}
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    onClick={addTeamMember}
                    disabled={teamMemberCount >= 2}
                    className="bg-gradient-to-r from-[#00ff80] to-[#1d8a54] text-black hover:opacity-90 rounded-lg"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Team Member
                  </Button>
                  {teamMemberCount > 0 && (
                    <Button
                      type="button"
                      onClick={removeTeamMember}
                      className="bg-[#222] text-white hover:bg-[#333] border-[#333] rounded-lg"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove Member
                    </Button>
                  )}
                </div>

                {Array.from({ length: teamMemberCount }).map((_, index) => (
                  <div key={index} className="space-y-4 pt-4 border-t border-[#333]">
                    <h3 className="text-lg font-semibold text-[#00ff80]">Team Member {index + 1}</h3>
                    {Object.keys(formSchema.shape).filter(key => key !== 'teamMembers' && key !== 'teamName').map((fieldName) => (
                      <FormField
                        key={fieldName}
                        control={form.control}
                        name={`teamMembers.${index}.${fieldName}` as keyof FormValues}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </FormLabel>
                            <FormControl>
                              {fieldName === 'branch' ? (
                                <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                  <FormControl>
                                    <SelectTrigger className="bg-[#222] border-[#333] text-white rounded-lg">
                                      <SelectValue placeholder={`Select ${fieldName}`} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-[#222] border-[#333] text-white rounded-lg">
                                    <SelectItems />
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  {...field}
                                  value={typeof field.value === 'string' ? field.value : ''}
                                  placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                  className="bg-[#222] border-[#333] text-white placeholder:text-gray-500 rounded-lg"
                                />
                              )}
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#00ff80] to-[#1d8a54] hover:opacity-90 text-black font-semibold rounded-lg"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
    <>
      <MatrixEffect />
      <div className="circuit-decoration" />
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-3xl">
          <Card className="bg-[#1a1a1a] border-[#333] shadow-2xl rounded-3xl">
            <CardHeader className="space-y-2 border-b border-[#333] bg-gradient-to-r from-[#00ff80]/10 to-[#1d8a54]/10 rounded-t-3xl">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#00ff80] to-[#1d8a54] bg-clip-text text-transparent">
                Registration Form
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fill in your details to register. You can participate solo or add up to 2 team members.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {Object.keys(formSchema.shape).filter(key => key !== 'teamMembers').map((fieldName) => (
                      <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName as keyof Omit<FormValues, 'teamMembers'>}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </FormLabel>
                            <FormControl>
                              {fieldName === 'branch' ? (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-[#222] border-[#333] text-white rounded-lg"> {/* Rounded dropdown */}
                                      <SelectValue placeholder={`Select ${fieldName}`} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-[#222] border-[#333] text-white rounded-lg"> {/* Rounded dropdown */}
                                    <SelectItem value="cse">Computer Science</SelectItem>
                                    <SelectItem value="ece">Electronics</SelectItem>
                                    <SelectItem value="me">Mechanical</SelectItem>
                                    <SelectItem value="ce">Civil</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  {...field}
                                  placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                  className="bg-[#222] border-[#333] text-white placeholder:text-gray-500 rounded-lg"
                                />
                              )}
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button
                      type="button"
                      onClick={addTeamMember}
                      disabled={teamMemberCount >= 2}
                      className="bg-gradient-to-r from-[#00ff80] to-[#1d8a54] text-black hover:opacity-90 rounded-lg" 
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                    {teamMemberCount > 0 && (
                      <Button
                        type="button"
                        onClick={removeTeamMember}
                        className="bg-[#222] text-white hover:bg-[#333] border-[#333] rounded-lg"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove Member
                      </Button>
                    )}
                  </div>

                  {Array.from({ length: teamMemberCount }).map((_, index) => (
                    <div key={index} className="space-y-4 pt-4 border-t border-[#333]">
                      <h3 className="text-lg font-semibold text-[#00ff80]">Team Member {index + 1}</h3>
                      {Object.keys(formSchema.shape).filter(key => key !== 'teamMembers').map((fieldName) => (
                        <FormField
                          key={fieldName}
                          control={form.control}
                          name={`teamMembers.${index}.${fieldName}` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">
                                {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </FormLabel>
                              <FormControl>
                                {fieldName === 'branch' ? (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-[#222] border-[#333] text-white rounded-lg"> {/* Rounded dropdown */}
                                        <SelectValue placeholder={`Select ${fieldName}`} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#222] border-[#333] text-white rounded-lg"> {/* Rounded dropdown */}
                                      <SelectItem value="cse">Computer Science</SelectItem>
                                      <SelectItem value="ece">Electronics</SelectItem>
                                      <SelectItem value="me">Mechanical</SelectItem>
                                      <SelectItem value="ce">Civil</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    {...field}
                                    placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                    className="bg-[#222] border-[#333] text-white placeholder:text-gray-500 rounded-lg"
                                  />
                                )}
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  ))}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#00ff80] to-[#1d8a54] hover:opacity-90 text-black font-semibold rounded-lg"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};