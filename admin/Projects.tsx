import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout.tsx';
import { dataService } from '../services/dataService.ts';
import { CATEGORIES } from '../constants.tsx';
import { CategoryType, Project } from '../types.ts';

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const thumbFileRef = useRef<HTMLInputElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await dataService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeProject = editingId ? projects.find(p => p.id === editingId) : null;

  useEffect(() => {
    if (isModalOpen) {
      setThumbnailUrl(activeProject?.thumbnailUrl || '');
      setMediaUrl(activeProject?.mediaUrl || '');
    } else {
      setThumbnailUrl('');
      setMediaUrl('');
    }
  }, [isModalOpen, activeProject]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const tagsString = (fd.get('tags')?.toString() || '');
    
    const data: Omit<Project, 'id' | 'date'> = {
      title: fd.get('title')?.toString() || '',
      description: fd.get('description')?.toString() || '',
      category: (fd.get('category')?.toString() || CATEGORIES[0]) as CategoryType,
      tags: tagsString.split(',').map(t => t.trim()).filter(Boolean),
      thumbnailUrl: thumbnailUrl,
      mediaUrl: mediaUrl,
      tools: activeProject?.tools || [],
      status: (fd.get('status')?.toString() || 'Published') as 'Published' | 'Draft' | 'Featured',
      client: activeProject?.client || '',
      liveUrl: fd.get('liveUrl')?.toString() || '',
      githubUrl: activeProject?.githubUrl || '',
    };

    try {
      if (editingId) {
        await dataService.updateProject(editingId, data as Partial<Project>);
      } else {
        await dataService.addProject(data);
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchProjects();
    } catch (err: any) {
      console.error('Save error details:', err);
      alert('Error saving project. Please check if your database credentials in api.php are correct.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await dataService.deleteProject(id);
        fetchProjects();
      } catch (err) {
        alert('Error deleting project');
      }
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setIsModalOpen(true);
  };

  if (loading) return (
    <AdminLayout>
      <div className="h-full flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-[5rem] font-black font-heading mb-2 uppercase tracking-tighter">PROJECTS</h1>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingId(null); }}
          className="w-full md:w-auto px-8 py-4 bg-red-600 rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center justify-center text-white text-xs tracking-widest uppercase font-black"
        >
          ADD PROJECT
        </button>
      </header>

      <div className="bg-gray-900/30 rounded-3xl border border-gray-800/60 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Project</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <img src={dataService.transformDriveUrl(p.thumbnailUrl)} className="w-16 h-10 md:w-20 md:h-12 rounded-xl object-cover mr-4 md:mr-6 border border-gray-800 shadow-lg group-hover:border-red-600/30 transition-colors" />
                      <div>
                        <p className="font-bold text-white text-sm md:text-base group-hover:text-red-500 transition-colors">{p.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs md:text-sm font-bold text-gray-400 text-center uppercase tracking-tight">{p.category}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] border ${p.status === 'Featured' ? 'bg-red-600/10 text-red-500 border-red-600/20' : p.status === 'Published' ? 'bg-green-600/10 text-green-500 border-green-600/20' : 'bg-gray-600/10 text-gray-500 border-gray-600/20'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => startEdit(p)} className="p-2 text-[10px] font-black bg-gray-900 rounded-lg mr-2 hover:bg-white hover:text-black transition-all uppercase tracking-widest px-4 py-2">EDIT</button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-[10px] font-black bg-gray-900 rounded-lg hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest px-4 py-2">DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-hidden">
          <div className="bg-[#0b0c10] border border-gray-800 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-black font-heading uppercase text-white mb-10 tracking-tighter">
              {editingId ? 'Edit Project' : 'New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Project Title</label>
                  <input name="title" required defaultValue={activeProject?.title} className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-1 focus:ring-red-600" placeholder="Title" />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Sector</label>
                  <select name="category" required defaultValue={activeProject?.category} className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-1 focus:ring-red-600 appearance-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Status</label>
                  <select name="status" required defaultValue={activeProject?.status || 'Published'} className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-1 focus:ring-red-600 appearance-none">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Featured">Featured</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Website Link (Live URL)</label>
                  <input name="liveUrl" defaultValue={activeProject?.liveUrl} className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-1 focus:ring-red-600" placeholder="https://..." />
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Tags (Comma Separated)</label>
                  <input name="tags" defaultValue={activeProject?.tags?.join(', ')} className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-1 focus:ring-red-600" placeholder="E.g. Branding, Minimal, 4K" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Thumbnail Asset (Image)</label>
                  <div className="flex gap-4 items-center">
                    <button type="button" onClick={() => thumbFileRef.current?.click()} className="flex-1 py-5 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase tracking-widest text-white">SELECT IMAGE</button>
                    {thumbnailUrl && <img src={dataService.transformDriveUrl(thumbnailUrl)} className="w-16 h-16 rounded-xl object-cover border border-gray-800" />}
                    <input type="file" ref={thumbFileRef} className="hidden" onChange={(e) => handleFileUpload(e, setThumbnailUrl)} accept="image/*" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Main Media Asset (Video/Image)</label>
                  <div className="flex gap-4 items-center">
                    <button type="button" onClick={() => mediaFileRef.current?.click()} className="flex-1 py-5 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase tracking-widest text-white">SELECT MEDIA</button>
                    {mediaUrl && <div className="text-[10px] font-bold text-red-500 bg-red-600/10 px-3 py-1 rounded-full uppercase tracking-widest">READY</div>}
                    <input type="file" ref={mediaFileRef} className="hidden" onChange={(e) => handleFileUpload(e, setMediaUrl)} accept="video/*,image/*" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Mission Details (Description)</label>
                <textarea name="description" required defaultValue={activeProject?.description} rows={5} className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white font-medium outline-none focus:ring-1 focus:ring-red-600 resize-none" placeholder="Project Description"></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-6 bg-red-600 rounded-2xl font-black text-white uppercase tracking-tighter hover:bg-red-700 transition-all text-lg shadow-xl shadow-red-900/20 disabled:opacity-50"
                >
                  {isSaving ? 'SAVING...' : (editingId ? 'SAVE CHANGES' : 'CREATE PROJECT')}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 py-6 bg-gray-900 rounded-2xl font-black text-white uppercase tracking-tighter hover:bg-gray-800 transition-all text-lg">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProjects;