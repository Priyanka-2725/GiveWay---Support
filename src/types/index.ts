
export type NGO = {
  id: string;
  ownerId: string; // Kept for legacy/simple lookup, but primary logic uses members
  members?: Record<string, 'owner' | 'manager'>;
  name: string;
  shortDescription: string;
  description: string;
  city: string;
  state: string;
  cause: string;
  verified: boolean;
  goalAmount: number;
  raisedAmount: number;
  createdAt: any;
  impactScore?: number;
  image?: string; 
  icon?: 'Heart' | 'BookOpen' | 'Globe' | 'ShieldCheck' | 'TreePine';
  contactEmail?: string;
};

export type UserRole = 'user' | 'ngo_admin' | 'admin' | 'superadmin';

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  userType?: 'donor' | 'ngo'; 
  followingNgoIds?: string[];
  recentSearchTerms?: string[];
  createdAt?: any;
};

export type Activity = {
  id: string;
  type: 'donation' | 'volunteer' | 'milestone';
  message: string;
  ngoId: string;
  ngoName: string;
  createdAt: any;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: any;
};

export type NgoNeed = {
  id: string;
  ngoId: string;
  description: string;
  status: 'open' | 'in progress' | 'completed';
  datePosted: any;
};

export type NgoPost = {
  id: string;
  ngoId: string;
  title: string;
  content: string;
  datePosted: any;
  imageUrl?: string;
  impactGoal?: number;
};

export type VolunteerRequest = {
  id: string;
  ngoId: string;
  ngoName: string;
  userId: string;
  userName: string;
  userEmail: string;
  skills: string;
  availability: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
};

export type Donation = {
  id: string;
  ngoId: string;
  ngoName: string;
  userId: string;
  userName: string;
  amount: number;
  message?: string;
  createdAt: any;
};
