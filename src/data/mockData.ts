// News/Articles
export const articles = [
  {
    id: '1',
    title: 'Community Leaders Meet to Discuss Future Initiatives',
    excerpt: 'A gathering of influential voices shapes the roadmap for our collective growth and prosperity.',
    content: `Our community came together last weekend for an unprecedented summit that brought together leaders from across all sectors. The discussions centered around sustainable growth, youth empowerment, and preserving our cultural heritage while embracing modern opportunities.

Key outcomes from the meeting include:
- Launch of a mentorship program connecting experienced professionals with young graduates
- Plans for an annual cultural festival celebrating our traditions
- Initiative to create a scholarship fund for deserving students
- Proposal for a community center that will serve as a hub for activities

The energy in the room was palpable as leaders shared their visions and committed to working together. This marks a new chapter in our community's journey towards excellence.`,
    category: 'Community',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    author: 'Editorial Team',
    date: '2024-01-15',
    readTime: '5 min',
  },
  {
    id: '2',
    title: 'Annual Cultural Festival Dates Announced',
    excerpt: 'Mark your calendars for the biggest celebration of our heritage this spring.',
    content: `The organizing committee has officially announced the dates for our annual cultural festival. This year's celebration promises to be bigger and more vibrant than ever before.

Scheduled for April 15-17, the three-day festival will feature:
- Traditional music and dance performances
- Art exhibitions showcasing local talent
- Culinary experiences with authentic recipes
- Workshops on traditional crafts and skills
- Youth competitions and talent shows

Tickets will go on sale next month, with early bird discounts available for community members.`,
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    author: 'Cultural Committee',
    date: '2024-01-10',
    readTime: '3 min',
  },
  {
    id: '3',
    title: 'Young Entrepreneur Launches Innovative Tech Startup',
    excerpt: 'Meet the 25-year-old whose app is changing how we connect with each other.',
    content: `In an inspiring story of innovation and determination, community member Priya Sharma has launched a groundbreaking app that helps people maintain cultural connections in the digital age.

The app, named "Roots," allows users to:
- Connect with family members worldwide
- Share family histories and stories
- Organize virtual gatherings
- Preserve recipes and traditions digitally

"I wanted to create something that brings us closer together, no matter where we are in the world," says Sharma. The app has already garnered over 10,000 downloads in its first month.`,
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    author: 'Tech Desk',
    date: '2024-01-08',
    readTime: '4 min',
  },
  {
    id: '4',
    title: 'Scholarship Program Opens Applications',
    excerpt: 'Opportunities for deserving students to pursue higher education with community support.',
    content: `The Community Education Foundation has announced the opening of applications for its annual scholarship program. This year, 50 scholarships worth $5,000 each will be awarded to outstanding students.

Eligibility criteria include:
- Academic excellence (GPA 3.5 or above)
- Community involvement
- Financial need
- Essay demonstrating commitment to community values

Applications are open until March 31st. Selection will be based on a combination of academic merit, community service, and financial need.`,
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    author: 'Education Foundation',
    date: '2024-01-05',
    readTime: '3 min',
  },
  {
    id: '5',
    title: 'Health Camp Serves Over 500 Community Members',
    excerpt: 'Free medical checkups and consultations provided at the community wellness initiative.',
    content: `Last Sunday's health camp was a resounding success, with over 500 community members receiving free medical consultations and basic health checkups.

Services provided included:
- Blood pressure and diabetes screening
- Eye examinations
- Dental checkups
- Nutrition counseling
- Mental health awareness sessions

Dr. Raj Patel, who organized the event, expressed gratitude to all the volunteer doctors and healthcare workers who made this possible.`,
    category: 'Health',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    author: 'Health Committee',
    date: '2024-01-02',
    readTime: '4 min',
  },
];

// Events
export const events = [
  {
    id: '1',
    title: 'New Year Networking Gala',
    description: 'An elegant evening of connections, conversations, and celebrations. Join fellow community members for an unforgettable night.',
    date: '2024-02-15',
    time: '7:00 PM',
    location: 'Grand Ballroom, Heritage Hotel',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    status: 'upcoming' as const,
    registrations: 145,
    capacity: 200,
  },
  {
    id: '2',
    title: 'Youth Leadership Workshop',
    description: 'A full-day intensive program designed to nurture the next generation of community leaders.',
    date: '2024-02-20',
    time: '9:00 AM',
    location: 'Community Center, Main Hall',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    status: 'upcoming' as const,
    registrations: 48,
    capacity: 60,
  },
  {
    id: '3',
    title: 'Cultural Heritage Day',
    description: 'Celebrate our rich traditions with music, dance, food, and art from across generations.',
    date: '2024-03-10',
    time: '10:00 AM',
    location: 'Central Park Pavilion',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    status: 'upcoming' as const,
    registrations: 320,
    capacity: 500,
  },
  {
    id: '4',
    title: 'Business Summit 2024',
    description: 'Connect with entrepreneurs, investors, and industry leaders in this premier business event.',
    date: '2024-03-25',
    time: '8:30 AM',
    location: 'Tech Hub Conference Center',
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
    status: 'upcoming' as const,
    registrations: 89,
    capacity: 150,
  },
  {
    id: '5',
    title: 'Winter Charity Drive',
    description: 'Our annual initiative to support those in need during the winter months.',
    date: '2024-01-10',
    time: '11:00 AM',
    location: 'Multiple Locations',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800',
    status: 'past' as const,
    registrations: 230,
    capacity: 300,
  },
];

// Jobs
export const jobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechVision Labs',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$150,000 - $200,000',
    description: 'We are looking for an experienced software engineer to lead our backend development team. You will be responsible for designing and implementing scalable systems.',
    requirements: ['5+ years experience', 'Python/Java expertise', 'Cloud infrastructure knowledge', 'Leadership experience'],
    posted: '2024-01-14',
    deadline: '2024-02-28',
  },
  {
    id: '2',
    title: 'Marketing Manager',
    company: 'Global Brands Inc.',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    description: 'Join our dynamic marketing team to drive brand awareness and customer engagement across multiple channels.',
    requirements: ['3+ years marketing experience', 'Digital marketing expertise', 'MBA preferred', 'Strong communication skills'],
    posted: '2024-01-12',
    deadline: '2024-02-15',
  },
  {
    id: '3',
    title: 'Financial Analyst',
    company: 'Wealth Partners',
    location: 'Chicago, IL',
    type: 'Full-time',
    salary: '$80,000 - $100,000',
    description: 'Analyze financial data, prepare reports, and provide insights to support investment decisions.',
    requirements: ['CFA or MBA', '2+ years in finance', 'Excel proficiency', 'Analytical mindset'],
    posted: '2024-01-10',
    deadline: '2024-02-20',
  },
  {
    id: '4',
    title: 'Product Designer',
    company: 'DesignCraft Studio',
    location: 'Remote',
    type: 'Full-time',
    salary: '$100,000 - $140,000',
    description: 'Create beautiful, intuitive product experiences for our suite of enterprise applications.',
    requirements: ['4+ years UX/UI experience', 'Figma expertise', 'Portfolio required', 'User research skills'],
    posted: '2024-01-08',
    deadline: '2024-02-10',
  },
  {
    id: '5',
    title: 'Healthcare Administrator',
    company: 'Community Health Network',
    location: 'Boston, MA',
    type: 'Full-time',
    salary: '$70,000 - $90,000',
    description: 'Manage daily operations of our community health clinic, ensuring excellent patient care and efficient processes.',
    requirements: ['Healthcare administration degree', '3+ years experience', 'HIPAA knowledge', 'Team management'],
    posted: '2024-01-05',
    deadline: '2024-02-01',
  },
];

// Matrimony Profiles
export const matrimonyProfiles = [
  {
    id: '1',
    name: 'Priya S.',
    age: 28,
    profession: 'Software Engineer',
    location: 'San Francisco, CA',
    education: 'MS Computer Science, Stanford',
    about: 'A passionate technologist who loves to travel and explore new cuisines. Looking for someone who shares my love for adventure and meaningful conversations.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    id: '2',
    name: 'Rahul M.',
    age: 31,
    profession: 'Investment Banker',
    location: 'New York, NY',
    education: 'MBA, Wharton',
    about: 'Finance professional with a creative side. Enjoy playing guitar, reading philosophy, and staying active. Seeking a partner who values both ambition and balance.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: '3',
    name: 'Anita K.',
    age: 26,
    profession: 'Doctor (Pediatrics)',
    location: 'Chicago, IL',
    education: 'MD, Johns Hopkins',
    about: 'Dedicated to making a difference in childrens lives. In my free time, I enjoy yoga, cooking, and volunteering. Looking for someone kind-hearted and family-oriented.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    id: '4',
    name: 'Vikram P.',
    age: 29,
    profession: 'Architect',
    location: 'Los Angeles, CA',
    education: 'MArch, UCLA',
    about: 'Designing spaces that inspire is my passion. Love photography, hiking, and exploring architecture around the world. Seeking someone creative and thoughtful.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    id: '5',
    name: 'Meera R.',
    age: 27,
    profession: 'Data Scientist',
    location: 'Seattle, WA',
    education: 'PhD Statistics, MIT',
    about: 'Combining my love for numbers with solving real-world problems. Enjoy hiking in the Pacific Northwest, painting, and trying new coffee shops.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  },
];

// Business Directory
export const businesses = [
  {
    id: '1',
    name: 'Spice Garden Restaurant',
    category: 'Restaurant',
    description: 'Authentic cuisine with a modern twist. Family-owned for over 25 years.',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Downtown',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  },
  {
    id: '2',
    name: 'Patel & Associates Law Firm',
    category: 'Legal',
    description: 'Comprehensive legal services specializing in business and immigration law.',
    phone: '+1 (555) 234-5678',
    address: '456 Business Park, Suite 200',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
  },
  {
    id: '3',
    name: 'Golden Touch Jewelers',
    category: 'Retail',
    description: 'Fine jewelry and custom designs. Trusted by families for generations.',
    phone: '+1 (555) 345-6789',
    address: '789 Heritage Mall',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
  },
  {
    id: '4',
    name: 'Wellness First Medical Center',
    category: 'Healthcare',
    description: 'Complete healthcare services with a focus on preventive care.',
    phone: '+1 (555) 456-7890',
    address: '321 Health Avenue',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
  },
  {
    id: '5',
    name: 'TechStart Solutions',
    category: 'Technology',
    description: 'IT consulting and software development for growing businesses.',
    phone: '+1 (555) 567-8901',
    address: '555 Innovation Hub',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  },
  {
    id: '6',
    name: 'Heritage Real Estate',
    category: 'Real Estate',
    description: 'Helping families find their dream homes for over 20 years.',
    phone: '+1 (555) 678-9012',
    address: '888 Property Lane',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
  },
];

// Chat Channels
export const chatChannels = [
  { id: 'general', name: 'General', description: 'Community-wide discussions', unread: 3 },
  { id: 'events', name: 'Events', description: 'Event announcements and discussions', unread: 0 },
  { id: 'jobs', name: 'Job Board', description: 'Career opportunities and advice', unread: 5 },
  { id: 'youth', name: 'Youth Corner', description: 'For our younger members', unread: 1 },
  { id: 'business', name: 'Business Network', description: 'Networking and collaborations', unread: 0 },
];

// Chat Messages
export const chatMessages = [
  { id: '1', channel: 'general', user: 'Admin', message: 'Welcome to the community chat! Feel free to introduce yourselves.', timestamp: '2024-01-15T10:00:00', isAdmin: true },
  { id: '2', channel: 'general', user: 'Priya S.', message: 'Happy to be here! Looking forward to connecting with everyone.', timestamp: '2024-01-15T10:05:00', isAdmin: false },
  { id: '3', channel: 'general', user: 'Rahul M.', message: 'Great to see so many familiar names. Who else is attending the networking gala next month?', timestamp: '2024-01-15T10:10:00', isAdmin: false },
  { id: '4', channel: 'general', user: 'Anita K.', message: 'I\'ll be there! It would be nice to finally meet in person.', timestamp: '2024-01-15T10:15:00', isAdmin: false },
  { id: '5', channel: 'general', user: 'Admin', message: 'Reminder: Registration for the gala closes on Feb 10th. Don\'t miss out!', timestamp: '2024-01-15T10:20:00', isAdmin: true },
];

export const categories = ['All', 'Community', 'Culture', 'Business', 'Education', 'Health'];
export const directoryCategories = ['All', 'Restaurant', 'Legal', 'Retail', 'Healthcare', 'Technology', 'Real Estate'];