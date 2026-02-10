import { Project, CategoryType, Message, SiteConfig } from '../types.ts';

const API_URL = './api.php';

const DEFAULT_CONFIG: SiteConfig = {
  logoText: 'DAT CLOUDE',
  logoImageUrl: '',
  logoPosition: 'left',
  logoX: 0,
  logoY: 0,
  footerDescription: 'A high-end portfolio and service-based e-commerce platform for creative professionals.',
  heroTitle: 'DESIGNING THE FUTURE OF DIGITAL EXPERIENCES.',
  heroSubtitle: 'We turn bold ideas into high-converting solutions.',
  heroImageUrl: '',
  heroVideoUrl: '',
  heroVideoOpacity: 100,
  heroTextColor: '#ffffff',
  heroTextPosition: 'left',
  heroTitleSize: 6.8,
  heroImageSize: 90,
  heroImageX: 0,
  heroImageY: 0,
  stats: {
    projects: 120,
    clients: 45,
    years: 8
  },
  socials: {
    instagram: '#',
    linkedin: '#'
  },
  tools: [],
  contactEmail: 'datcloud20@gmail.com',
  whatsappNumber: ''
};

class DataService {
  async fetchAPI(action: string, method: string = 'GET', body: any = null) {
    const url = body && method === 'GET' ? `${API_URL}?action=${action}&${new URLSearchParams(body)}` : `${API_URL}?action=${action}`;
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body && method !== 'GET') options.body = JSON.stringify(body);
    
    try {
      const response = await fetch(url, options);
      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resData.error || `API Error: ${response.statusText}`);
      }
      return resData;
    } catch (e) {
      throw e;
    }
  }

  async login(email, password) {
    return await this.fetchAPI('login', 'POST', { email, password });
  }

  async signup(email, password, fullName) {
    return await this.fetchAPI('register', 'POST', { email, password, fullName });
  }

  async getConfig(): Promise<SiteConfig> {
    try {
      const data = await this.fetchAPI('get_config');
      if (!data || Object.keys(data).length === 0) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...data };
    } catch (e) {
      console.warn("DB Fetch Error, using local/default fallback", e);
      const local = localStorage.getItem('datcloude_config');
      return local ? { ...DEFAULT_CONFIG, ...JSON.parse(local) } : DEFAULT_CONFIG;
    }
  }

  async updateConfig(config: SiteConfig): Promise<void> {
    try {
      await this.fetchAPI('update_config', 'POST', config);
      localStorage.setItem('datcloude_config', JSON.stringify(config));
    } catch (e) {
      console.error("Failed to sync config with server", e);
      throw e;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      return await this.fetchAPI('get_projects');
    } catch (e) {
      const local = localStorage.getItem('datcloude_projects');
      return local ? JSON.parse(local) : [];
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter(p => p.status === 'Featured');
  }

  async getProjectsByCategory(category: CategoryType): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter(p => p.category === category);
  }

  async getProjectById(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  async addProject(project: Omit<Project, 'id' | 'date'>): Promise<Project> {
    const res = await this.fetchAPI('add_project', 'POST', project);
    const newProject: Project = {
      ...project,
      id: res.id,
      date: new Date().toISOString()
    } as Project;
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    await this.fetchAPI(`update_project&id=${id}`, 'POST', updates);
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetchAPI(`delete_project&id=${id}`, 'DELETE');
  }

  async getMessages(): Promise<Message[]> {
    try {
      return await this.fetchAPI('get_messages');
    } catch (e) {
      return [];
    }
  }

  async addMessage(msg: Omit<Message, 'id' | 'date'>): Promise<void> {
    await this.fetchAPI('add_message', 'POST', msg);
  }

  async deleteMessage(id: string): Promise<void> {
    await this.fetchAPI(`delete_message&id=${id}`, 'DELETE');
  }

  public transformDriveUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('https://cdn.')) return url;
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const match = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
      if (match && match[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  }
}

export const dataService = new DataService();