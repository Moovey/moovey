import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { PREDEFINED_SERVICES } from '@/constants/services';

type BasicListing = {
  name: string;
  description: string;
  logoDataUrl?: string; // small JPEG stored as data URL for preview/temp persistence
  services: string[];
};

const STORAGE_KEY = 'business.basicListing';

type PageProps = { profile?: { name?: string; description?: string; logoUrl?: string | null; plan?: string; services?: string[] } } & Record<string, unknown>;

export default function BusinessServices() {
  const { props } = usePage<PageProps>();
  const initialProfile = props.profile ?? {};
  const [listing, setListing] = useState<BasicListing>({
    name: initialProfile.name || '',
    description: initialProfile.description || '',
    logoDataUrl: (initialProfile.logoUrl as string | undefined) || undefined,
    services: (initialProfile.services as string[] | undefined) || [],
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customService, setCustomService] = useState('');
  const servicesSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    // If props change (visit), refresh listing
    setListing({
      name: initialProfile.name || '',
      description: initialProfile.description || '',
      logoDataUrl: (initialProfile.logoUrl as string | undefined) || undefined,
      services: (initialProfile.services as string[] | undefined) || [],
    });
  }, [initialProfile.name, initialProfile.description, (initialProfile as any).logoUrl, (initialProfile as any).services]);

  const onChange = (field: keyof BasicListing) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    // enforce short description length ~140 chars
    if (field === 'description' && value.length > 140) return;
    setListing((prev) => ({ ...prev, [field]: value }));
  };

  const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // JPEG only, small size (<= 200 KB)
    if (!/jpe?g$/i.test(file.name) || (file.type && file.type !== 'image/jpeg')) {
      setError('Please upload a JPEG (.jpg or .jpeg) logo.');
      toast.error('Please upload a JPEG (.jpg or .jpeg) logo.');
      e.target.value = '';
      return;
    }
    const maxBytes = 200 * 1024;
    if (file.size > maxBytes) {
      setError('Logo too large. Please upload a JPEG under 200 KB.');
      toast.error('Logo too large. Please upload a JPEG under 200 KB.');
      e.target.value = '';
      return;
    }
    
    // First save the current form data, then upload logo
    router.patch('/business/api/profile', { 
      name: listing.name, 
      description: listing.description, 
      services: listing.services 
    }, {
      preserveScroll: true,
      onSuccess: () => {
        // After saving form data, upload the logo
        const form = new FormData();
        form.append('logo', file);
        router.post('/business/api/profile/logo', form, {
          preserveScroll: true,
          forceFormData: true,
          onSuccess: () => {
            // Logo uploaded successfully
            setSavedAt(new Date().toLocaleTimeString());
            toast.success('Logo uploaded and form saved successfully!');
          },
          onError: () => {
            setError('Failed to upload logo.');
            toast.error('Failed to upload logo.');
          },
        });
      },
      onError: () => {
        setError('Failed to save form data before logo upload.');
        toast.error('Failed to save form data before logo upload.');
      },
    });
  };

  const clearLogo = () => {
    setListing((prev) => ({ ...prev, logoDataUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addService = (service: string) => {
    const value = service.trim();
    if (!value) return;
    if (value.length > 60) {
      setError('Service name too long (max 60 chars).');
      return;
    }
    setError(null);
    setListing((prev) => {
      if (prev.services.includes(value)) return prev;
      return { ...prev, services: [...prev.services, value] };
    });
  };

  const removeService = (service: string) => {
    setListing((prev) => ({ ...prev, services: prev.services.filter((s) => s !== service) }));
  };

  const onSelectPredefined = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) addService(val);
    // reset back to placeholder
    if (servicesSelectRef.current) servicesSelectRef.current.selectedIndex = 0;
  };

  const onAddCustomService = () => {
    addService(customService);
    setCustomService('');
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    router.patch('/business/api/profile', { name: listing.name, description: listing.description, services: listing.services }, {
      preserveScroll: true,
      onSuccess: () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listing));
        setSavedAt(new Date().toLocaleTimeString());
        toast.success('Basic listing saved successfully!');
      },
      onError: () => {
        setError('Failed to save. Please try again.');
        toast.error('Failed to save basic listing. Please try again.');
      },
      onFinish: () => setSaving(false),
    });
  };

  const resetForm = async () => {
    // Clear the form in the UI immediately
    setListing({
      name: '',
      description: '',
      logoDataUrl: undefined,
      services: [],
    });
    setCustomService('');
    setSavedAt(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (servicesSelectRef.current) servicesSelectRef.current.selectedIndex = 0;

    // Delete the logo first if it exists
    if (initialProfile.logoUrl) {
      router.delete('/business/api/profile/logo', {
        preserveScroll: true,
        onError: () => {
          setError('Failed to delete logo.');
          toast.error('Failed to delete logo.');
        },
      });
    }

    // Also clear the data in the database
    router.patch('/business/api/profile', { name: '', description: '', services: [] }, {
      preserveScroll: true,
      onSuccess: () => {
        localStorage.removeItem(STORAGE_KEY);
        toast.success('Form reset successfully!');
      },
      onError: () => {
        setError('Failed to reset form. Please try again.');
        toast.error('Failed to reset form. Please try again.');
      },
    });
  };

  return (
    <DashboardLayout>
      <Head title="Business Services" />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] text-white rounded-xl p-8 mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Services</h1>
            <p className="text-lg opacity-90">Set up your Free Basic Listing</p>
          </div>
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">🛠️</div>
        </div>
      </div>

      <BusinessNavTabs active="services" />

      {/* Free Basic Listing */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1A237E]">Free Basic Listing</h2>
          <p className="text-gray-600 text-sm">A simple one-line entry: name + short description, and a small JPEG logo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <Label htmlFor="biz-name" className="text-gray-700 font-medium">Business Name</Label>
              <Input
                id="biz-name"
                value={listing.name}
                onChange={onChange('name')}
                placeholder="e.g. Rapid Move Co."
                className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="biz-desc" className="text-gray-700 font-medium">Short Description</Label>
              <input
                id="biz-desc"
                value={listing.description}
                onChange={onChange('description') as any}
                placeholder="e.g. Reliable house moves across the UK"
                className="mt-2 w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#00BCD4] focus:ring-[#00BCD4]/20"
              />
              <div className="text-xs text-gray-500 mt-1">Up to 140 characters • {listing.description.length}/140</div>
            </div>
            {/* Services selection */}
            <div>
              <Label htmlFor="services-select" className="text-gray-700 font-medium">Offered Services</Label>
              <div className="mt-2 flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <select
                    id="services-select"
                    ref={servicesSelectRef}
                    onChange={onSelectPredefined}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#00BCD4] focus:ring-[#00BCD4]/20"
                  >
                    <option value="">Select a service…</option>
                    {PREDEFINED_SERVICES.map((s) => (
                      <option key={s} value={s} disabled={listing.services.includes(s)}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Add a custom service"
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onAddCustomService();
                      }
                    }}
                    className="bg-white text-gray-900 placeholder:text-gray-500"
                  />
                  <Button type="button" onClick={onAddCustomService} className="bg-gray-100 text-gray-800 hover:bg-gray-200">Add</Button>
                </div>
                {listing.services.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {listing.services.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 bg-[#E0F7FA] text-[#1A237E] px-2 py-1 rounded-full text-xs border border-[#B2EBF2]">
                        {s}
                        <button type="button" aria-label={`Remove ${s}`} className="ml-1 text-[#1A237E] hover:text-red-600" onClick={() => removeService(s)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500">Choose from common services or add your own. Max length 60 characters.</div>
              </div>
            </div>
            <div>
              <Label htmlFor="biz-logo" className="text-gray-700 font-medium">Small Logo (JPEG)</Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="biz-logo"
                  type="file"
                  accept="image/jpeg"
                  ref={fileInputRef}
                  onChange={onPickLogo}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#E0F7FA] file:text-[#1A237E] hover:file:bg-[#d3f1f4]"
                />
                {listing.logoDataUrl ? (
                  <Button type="button" className="bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={clearLogo}>Remove</Button>
                ) : null}
              </div>
              <div className="text-xs text-gray-500 mt-1">JPEG only • Max 200 KB</div>
              {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={save} disabled={saving} className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white">
                {saving ? 'Saving…' : 'Save Basic Listing'}
              </Button>
              <Button type="button" onClick={resetForm} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                Reset Form
              </Button>
              {savedAt && <span className="text-xs text-green-600">Saved at {savedAt}</span>}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-[#F5F5F5] rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2 font-medium">Public Preview</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                  {initialProfile.logoUrl ? (
                    <img src={initialProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">🏷️</span>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-semibold text-[#1A237E] truncate">{listing.name || 'Your Business Name'}</div>
                  <div className="text-xs text-gray-600 truncate">{listing.description || 'Short description of your services'}</div>
                </div>
              </div>
              {listing.services.length > 0 && (
                <div className="mt-2 text-[11px] text-gray-700 truncate">
                  Services: {listing.services.join(', ')}
                </div>
              )}
              <div className="mt-3 text-[11px] text-gray-500">
                This is how your free listing will appear to customers before you activate a premium profile.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade (Upsell) */}
      <div className="bg-[#E0F7FA] rounded-xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div>
            <h3 className="text-2xl font-bold text-[#1A237E] mb-2">Activate Your Premium Profile — Free for 12 Months</h3>
            <p className="text-gray-700 mb-4 max-w-2xl">
              When a customer tries to connect with you, we’ll email you a link to activate your Moovey profile. Activate to enjoy a free
              12‑month premium trial and unlock customer connections and more.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#1A237E]">
              <li>• Add full business details</li>
              <li>• Upload more photos</li>
              <li>• Collect reviews</li>
              <li>• Show map locations</li>
              <li>• Instant messaging with customers</li>
            </ul>
          </div>
          <div className="shrink-0">
            <Link href="/business/profile" className="inline-flex items-center px-6 py-3 bg-[#00BCD4] text-white rounded-lg font-semibold hover:bg-[#00ACC1] transition-colors">
              Start Free 12‑Month Trial
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div className="text-[11px] text-gray-600 mt-2">Only upgraded businesses can message customers.</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
