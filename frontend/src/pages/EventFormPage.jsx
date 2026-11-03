import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { PageLoader } from '../components/Loaders';
import { getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Workshop'];

// Convert an ISO date to the local "YYYY-MM-DDTHH:mm" value a datetime-local input expects
const toLocalInput = (iso) => {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const defaultForm = {
  title: '', description: '', category: 'Tech', venue: '',
  date: '', registrationFee: 0, googleFormLink: '',
};

export default function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    eventsAPI.getOne(id)
      .then(({ data }) => {
        const ev = data.event;
        setForm({
          title: ev.title,
          description: ev.description,
          category: ev.category,
          venue: ev.venue,
          date: toLocalInput(ev.date),
          registrationFee: ev.registrationFee,
          googleFormLink: ev.googleFormLink,
        });
        if (ev.posterImage) setExistingImage(getImageUrl(ev.posterImage));
      })
      .catch(() => { toast.error('Event not found'); navigate('/admin'); })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.venue || !form.date || !form.googleFormLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      // send an unambiguous UTC timestamp so the server doesn't guess the timezone
      formData.set('date', new Date(form.date).toISOString());
      if (imageFile) formData.append('posterImage', imageFile);

      if (isEdit) {
        await eventsAPI.update(id, formData);
        toast.success('Event updated successfully!');
        navigate(`/events/${id}`);
      } else {
        const { data } = await eventsAPI.create(formData);
        toast.success('Event created successfully! 🎉');
        navigate(`/events/${data.event._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  const currentImage = imagePreview || existingImage;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">
          {isEdit ? '✏️ Edit Event' : '🎉 Create Event'}
        </h1>
        <p className="text-slate-500 text-sm">Fill in the event details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Poster upload */}
        <div className="glass-card rounded-2xl p-5">
          <label className="block text-sm text-slate-500 mb-3">Event Poster</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary-400 rounded-xl cursor-pointer transition-colors overflow-hidden"
          >
            {currentImage ? (
              <div className="relative">
                <img src={currentImage} alt="Preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Click to change image</p>
                </div>
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center gap-2 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Click to upload poster</p>
                <p className="text-xs">JPEG, PNG, GIF up to 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        {/* Main fields */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <Field label="Event Title *" name="title" type="text" placeholder="e.g. Tech Hackathon 2025"
            value={form.title} onChange={handleChange} />

          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Description *</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe the event in detail..."
              value={form.description}
              onChange={handleChange}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-500 mb-1.5">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Field label="Registration Fee (₹)" name="registrationFee" type="number"
              placeholder="0 for free" value={form.registrationFee} onChange={handleChange} min={0} />
          </div>

          <Field label="Venue *" name="venue" type="text" placeholder="e.g. Main Auditorium, Block A"
            value={form.venue} onChange={handleChange} />

          <Field label="Date & Time *" name="date" type="datetime-local"
            value={form.date} onChange={handleChange} />

          <Field label="Google Form Registration Link *" name="googleFormLink" type="url"
            placeholder="https://forms.google.com/..." value={form.googleFormLink} onChange={handleChange} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? '✓ Update Event' : '🎉 Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, min }) {
  return (
    <div>
      <label className="block text-sm text-slate-500 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        className="input-field"
      />
    </div>
  );
}
