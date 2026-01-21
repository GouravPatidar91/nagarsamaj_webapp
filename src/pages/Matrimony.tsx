import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Briefcase, Heart, X, User, Plus, Edit, Clock, Upload, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useMatrimonyProfiles, 
  useMatrimonyInterests, 
  useSendInterest, 
  useMyMatrimonyProfile,
  useCreateMatrimonyProfile,
  useUpdateMatrimonyProfile,
  type MatrimonyProfile 
} from '@/hooks/useMatrimony';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function MatrimonyContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profiles = [], isLoading } = useMatrimonyProfiles();
  const { data: myProfile, isLoading: isLoadingMyProfile } = useMyMatrimonyProfile(user?.id);
  const { data: interestedProfileIds = [] } = useMatrimonyInterests(user?.id);
  const sendInterestMutation = useSendInterest();
  const createProfileMutation = useCreateMatrimonyProfile();
  const updateProfileMutation = useUpdateMatrimonyProfile();

  const [selectedProfile, setSelectedProfile] = useState<MatrimonyProfile | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    occupation: '',
    education: '',
    location: '',
    about: '',
    photo_url: '',
  });

  const handleInterest = async (profileId: string, profileName: string) => {
    if (!user) return;

    if (interestedProfileIds.includes(profileId)) {
      toast({ title: 'Interest already sent', description: `You've already expressed interest in ${profileName}.` });
      return;
    }

    try {
      await sendInterestMutation.mutateAsync({ profileId, userId: user.id });
      toast({
        title: 'Interest expressed',
        description: `${profileName} will be notified of your interest.`,
      });
    } catch (error) {
      toast({ title: 'Failed to send interest', variant: 'destructive' });
    }
  };

  const handleOpenCreateForm = () => {
    if (myProfile) {
      setFormData({
        full_name: myProfile.full_name || '',
        age: myProfile.age?.toString() || '',
        gender: myProfile.gender || '',
        occupation: myProfile.occupation || '',
        education: myProfile.education || '',
        location: myProfile.location || '',
        about: myProfile.about || '',
        photo_url: myProfile.photo_url || '',
      });
      setIsEditing(true);
    } else {
      setFormData({
        full_name: user?.name || '',
        age: '',
        gender: '',
        occupation: '',
        education: '',
        location: '',
        about: '',
        photo_url: '',
      });
      setIsEditing(false);
    }
    setShowCreateForm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('matrimony-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('matrimony-photos')
        .getPublicUrl(fileName);

      setFormData({ ...formData, photo_url: publicUrl });
      toast({ title: 'Photo uploaded', description: 'Your photo has been uploaded successfully.' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Upload failed', 
        description: error.message || 'Failed to upload photo. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.full_name.trim()) {
      toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }

    try {
      if (isEditing && myProfile) {
        await updateProfileMutation.mutateAsync({
          id: myProfile.id,
          full_name: formData.full_name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          occupation: formData.occupation || null,
          education: formData.education || null,
          location: formData.location || null,
          about: formData.about || null,
          photo_url: formData.photo_url || null,
        });
        toast({ title: 'Profile updated', description: 'Your matrimony profile has been updated.' });
      } else {
        await createProfileMutation.mutateAsync({
          user_id: user.id,
          full_name: formData.full_name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          occupation: formData.occupation || null,
          education: formData.education || null,
          location: formData.location || null,
          about: formData.about || null,
          photo_url: formData.photo_url || null,
          status: 'pending',
        });
        toast({ 
          title: 'Profile submitted', 
          description: 'Your profile has been submitted for review. It will be visible once approved.' 
        });
      }
      setShowCreateForm(false);
    } catch (error: any) {
      toast({ 
        title: 'Failed to save profile', 
        description: error.message || 'Something went wrong',
        variant: 'destructive' 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending Review</Badge>;
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-12"
          >
            <h1 className="heading-display mb-4">Matrimony</h1>
            <p className="text-xl text-muted-foreground">
              Find your life partner within our trusted community. All profiles are verified and handled with utmost privacy and respect.
            </p>
          </motion.div>

          {/* User's Own Profile Status */}
          {!isLoadingMyProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              {myProfile ? (
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {myProfile.photo_url ? (
                          <img src={myProfile.photo_url} alt="Your profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Your Matrimony Profile</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(myProfile.status || 'pending')}
                          {myProfile.status === 'pending' && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Under review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleOpenCreateForm} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">Create Your Matrimony Profile</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Share your profile to connect with potential matches in our community.
                      </p>
                    </div>
                    <Button onClick={handleOpenCreateForm} className="btn-gold">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 border border-border/50 rounded-xl p-6 mb-10"
          >
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground">Privacy First:</strong> All information shared here is kept confidential. Contact details are only shared after mutual interest is expressed.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No profiles available at the moment.</p>
              <p className="text-muted-foreground text-sm mt-2">Be the first to create a profile!</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {profiles.filter(p => p.user_id !== user?.id).map((profile) => (
                <motion.div key={profile.id} variants={itemVariants} className="card-elevated group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-lg">{profile.full_name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {profile.age ? `${profile.age} years` : 'Age not specified'}
                        {profile.gender && ` • ${profile.gender}`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {profile.occupation && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profile.occupation}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profile.location}</span>
                      </div>
                    )}
                    {profile.education && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profile.education}</span>
                      </div>
                    )}
                  </div>

                  {profile.about && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{profile.about}</p>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedProfile(profile)}>
                      View Profile
                    </Button>
                    <Button
                      variant={interestedProfileIds.includes(profile.id) ? 'secondary' : 'default'}
                      className={!interestedProfileIds.includes(profile.id) ? 'btn-gold' : ''}
                      onClick={() => handleInterest(profile.id, profile.full_name)}
                      disabled={interestedProfileIds.includes(profile.id) || sendInterestMutation.isPending}
                    >
                      {interestedProfileIds.includes(profile.id) ? (
                        <>
                          <Heart className="w-4 h-4 mr-1 fill-primary text-primary" />
                          Sent
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-1" />
                          Interest
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Profile Detail Modal */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="sr-only">Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  {selectedProfile.photo_url ? (
                    <img
                      src={selectedProfile.photo_url}
                      alt={selectedProfile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold">{selectedProfile.full_name}</h2>
                  <p className="text-muted-foreground">
                    {selectedProfile.age ? `${selectedProfile.age} years` : 'Age not specified'}
                    {selectedProfile.gender && ` • ${selectedProfile.gender}`}
                  </p>
                  <div className="mt-4 space-y-2">
                    {selectedProfile.occupation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span>{selectedProfile.occupation}</span>
                      </div>
                    )}
                    {selectedProfile.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{selectedProfile.location}</span>
                      </div>
                    )}
                    {selectedProfile.education && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span>{selectedProfile.education}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedProfile.about && (
                <div>
                  <h3 className="font-display font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedProfile.about}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border/50">
                <Button
                  className={`flex-1 ${!interestedProfileIds.includes(selectedProfile.id) ? 'btn-gold' : ''}`}
                  variant={interestedProfileIds.includes(selectedProfile.id) ? 'secondary' : 'default'}
                  onClick={() => handleInterest(selectedProfile.id, selectedProfile.full_name)}
                  disabled={interestedProfileIds.includes(selectedProfile.id) || sendInterestMutation.isPending}
                >
                  {interestedProfileIds.includes(selectedProfile.id) ? (
                    <>
                      <Heart className="w-4 h-4 mr-2 fill-primary text-primary" />
                      Interest Sent
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Express Interest
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Profile Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Your Profile' : 'Create Matrimony Profile'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProfile} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter your age"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="Your profession"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="Highest qualification"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.photo_url ? 'Change Photo' : 'Upload Photo'}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About Yourself</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                placeholder="Tell us about yourself, your interests, what you're looking for..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 btn-gold"
                disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
              >
                {createProfileMutation.isPending || updateProfileMutation.isPending 
                  ? 'Saving...' 
                  : isEditing 
                    ? 'Update Profile' 
                    : 'Submit Profile'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>

            {!isEditing && (
              <p className="text-xs text-muted-foreground text-center">
                Your profile will be reviewed before it becomes visible to others.
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default function Matrimony() {
  return (
    <ProtectedRoute>
      <MatrimonyContent />
    </ProtectedRoute>
  );
}
