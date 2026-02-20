import { getLabList, getLabLogoUploadUrl, updateLabById } from '@/../services/labServices';
import { useLabs } from '@/context/LabContext';
import { LabResponse } from '@/types/Lab';
import { useEffect, useRef, useState } from 'react';
import Loader from '../common/Loader';
import TableComponent from '../common/TableComponent';
import { toast } from 'react-toastify';
import { FaEye } from "react-icons/fa";
import Modal from '../common/Model';

const LabList = () => {
  const { labs, setLabs } = useLabs();
  const [loading, setLoading] = useState<boolean>(false);
  const { currentLab } = useLabs();
  const [viewLabPopup, setViewLabPopup] = useState(false);
  const [viewLabDetails, setViewLabDetails] = useState<LabResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<LabResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDateTime = (value?: string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const buildEditForm = (lab: LabResponse) => ({
    ...lab,
    logo: lab.logo || '',
    labLogo: lab.labLogo || '',
    description: lab.description || '',
    address: lab.address || '',
    city: lab.city || '',
    state: lab.state || '',
    labZip: lab.labZip || '',
    labCountry: lab.labCountry || '',
    labPhone: lab.labPhone || '',
    labEmail: lab.labEmail || '',
    licenseNumber: lab.licenseNumber || '',
    labType: lab.labType || '',
    directorName: lab.directorName || '',
    directorEmail: lab.directorEmail || '',
    directorPhone: lab.directorPhone || '',
    certificationBody: lab.certificationBody || '',
    labCertificate: lab.labCertificate || '',
    directorGovtId: lab.directorGovtId || '',
    labBusinessRegistration: lab.labBusinessRegistration || '',
    labLicense: lab.labLicense || '',
    taxId: lab.taxId || '',
    labAccreditation: lab.labAccreditation || '',
  });

  const startEdit = () => {
    if (!viewLabDetails) return;
    setEditForm(buildEditForm(viewLabDetails));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditForm(viewLabDetails ? buildEditForm(viewLabDetails) : null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editForm || isUploadingLogo) return;
    try {
      setIsSaving(true);
      const payload = {
        name: editForm.name,
        description: editForm.description,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        labZip: editForm.labZip,
        labCountry: editForm.labCountry,
        labPhone: editForm.labPhone,
        labEmail: editForm.labEmail,
        licenseNumber: editForm.licenseNumber,
        labType: editForm.labType,
        labLogo: editForm.labLogo || editForm.logo,
        directorName: editForm.directorName,
        directorEmail: editForm.directorEmail,
        directorPhone: editForm.directorPhone,
        certificationBody: editForm.certificationBody,
        labCertificate: editForm.labCertificate,
        directorGovtId: editForm.directorGovtId,
        labBusinessRegistration: editForm.labBusinessRegistration,
        labLicense: editForm.labLicense,
        taxId: editForm.taxId,
        labAccreditation: editForm.labAccreditation,
        dataPrivacyAgreement: editForm.dataPrivacyAgreement,
        isActive: editForm.isActive,
      };
      const updated = await updateLabById(editForm.id, payload);
      setViewLabDetails(updated);
      setLabs(labs.map(lab => (lab.id === updated.id ? { ...lab, ...updated } : lab)));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      e.target.value = '';
      return;
    }
    const contentType = file.type || 'application/octet-stream';

    try {
      setIsUploadingLogo(true);
      const { uploadUrl, fileUrl, headers } = await getLabLogoUploadUrl(editForm.id, file.name, contentType);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: headers && Object.keys(headers).length > 0 ? headers : { 'Content-Type': contentType },
      });
      if (!uploadResponse.ok) {
        throw new Error('Upload failed.');
      }
      setEditForm((prev) => (prev ? { ...prev, labLogo: fileUrl } : prev));
      toast.success('Logo uploaded successfully.');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to upload logo.');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    setLoading(true);
    getLabList()
      .then((labs: LabResponse[]) => {
        setLabs(labs);
      })
      .catch(() => {
        // Handle lab list fetch error
      })
      .finally(() => setLoading(false));
  }, [currentLab, setLabs]);
  

  

  const columns = [
    { header: 'ID', accessor: (item: LabResponse) => item.id },
    { header: 'Name', accessor: (item: LabResponse) => item.name },
    { header: 'Address', accessor: (item: LabResponse) => item.address },
    { header: 'City', accessor: (item: LabResponse) => item.city },
    { header: 'State', accessor: (item: LabResponse) => item.state },
    { header: 'Created By', accessor: (item: LabResponse) => item.createdByName },
    {
      header: 'Active',
      accessor: (item: LabResponse) => (
        <span className={`px-2 py-1 rounded ${item.isActive ? 'bg-green-500 text-white text-xs' : 'bg-red-500 text-white text-xs'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (item: LabResponse) => (
        <div className='flex items-center space-x-2'>
          <FaEye
            onClick={() => {
              setViewLabPopup(true);
              setViewLabDetails(item);
            }}
            className="cursor-pointer text-primary"
          />
        </div>
      )
    }
  ];

  return (
    <div>
      <Modal
        isOpen={viewLabPopup}
        onClose={() => {
          setViewLabPopup(false);
          setIsEditing(false);
          setEditForm(null);
        }}
        title="View Lab"
        modalClassName='max-w-5xl'
      >
        {viewLabDetails ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                {(isEditing ? editForm?.labLogo || editForm?.logo : viewLabDetails.labLogo || viewLabDetails.logo) ? (
                  <img
                    src={((isEditing ? editForm?.labLogo || editForm?.logo : viewLabDetails.labLogo || viewLabDetails.logo) || '') as string}
                    alt={`${viewLabDetails.name || 'Lab'} logo`}
                    className="h-14 w-14 rounded-lg border border-gray-200 object-contain bg-white"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600">
                    {viewLabDetails.name?.slice(0, 2).toUpperCase() || 'LB'}
                  </div>
                )}
                <div className="space-y-1">
                  {isEditing ? (
                    <>
                      <input
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.name || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                        placeholder="Lab name"
                      />
                      <input
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs uppercase tracking-widest text-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.labType || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labType: e.target.value } : prev))}
                        placeholder="Lab type"
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-semibold text-gray-900">{viewLabDetails.name || 'N/A'}</div>
                      <div className="text-xs uppercase tracking-wide text-gray-500">{viewLabDetails.labType || 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <select
                    className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={editForm?.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setEditForm((prev) => (prev ? { ...prev, isActive: e.target.value === 'active' } : prev))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${viewLabDetails.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {viewLabDetails.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || isUploadingLogo}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : (isUploadingLogo ? 'Uploading...' : 'Save')}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startEdit}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Overview</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Description</span>
                    {isEditing ? (
                      <textarea
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        rows={3}
                        value={editForm?.description || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.description || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">License No</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.licenseNumber || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, licenseNumber: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.licenseNumber || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tax ID</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.taxId || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, taxId: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.taxId || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Accreditation</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.labAccreditation || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labAccreditation: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.labAccreditation || 'N/A'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="font-medium text-gray-600">Data Privacy</span>
                    {isEditing ? (
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={!!editForm?.dataPrivacyAgreement}
                          onChange={(e) => setEditForm((prev) => (prev ? { ...prev, dataPrivacyAgreement: e.target.checked } : prev))}
                        />
                        Enabled
                      </label>
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.dataPrivacyAgreement ? 'Yes' : 'No'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Contact</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Phone</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.labPhone || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labPhone: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.labPhone || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.labEmail || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labEmail: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.labEmail || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Director</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.directorName || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, directorName: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.directorName || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Director Email</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.directorEmail || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, directorEmail: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.directorEmail || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Director Phone</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.directorPhone || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, directorPhone: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.directorPhone || 'N/A'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Address</div>
                {isEditing ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Address"
                      value={editForm?.address || ''}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, address: e.target.value } : prev))}
                    />
                    <input
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="City"
                      value={editForm?.city || ''}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, city: e.target.value } : prev))}
                    />
                    <input
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="State"
                      value={editForm?.state || ''}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, state: e.target.value } : prev))}
                    />
                    <input
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Zip"
                      value={editForm?.labZip || ''}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labZip: e.target.value } : prev))}
                    />
                    <input
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 md:col-span-2"
                      placeholder="Country"
                      value={editForm?.labCountry || ''}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labCountry: e.target.value } : prev))}
                    />
                  </div>
                ) : (
                  <div className="text-sm text-gray-900">
                    {viewLabDetails.address || 'N/A'}, {viewLabDetails.city || 'N/A'}, {viewLabDetails.state || 'N/A'}
                    {viewLabDetails.labZip ? `, ${viewLabDetails.labZip}` : ''}
                    {viewLabDetails.labCountry ? `, ${viewLabDetails.labCountry}` : ''}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Compliance</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Certification Body</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.certificationBody || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, certificationBody: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.certificationBody || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Lab Certificate</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.labCertificate || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labCertificate: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.labCertificate || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Director Govt ID</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.directorGovtId || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, directorGovtId: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.directorGovtId || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Business Registration</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.labBusinessRegistration || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labBusinessRegistration: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.labBusinessRegistration || 'N/A'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Lab License</span>
                    {isEditing ? (
                      <input
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={editForm?.labLicense || ''}
                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labLicense: e.target.value } : prev))}
                      />
                    ) : (
                      <span className="text-gray-900">{viewLabDetails.labLicense || 'N/A'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Audit</div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-gray-600">Created By:</span> <span className="text-gray-900">{viewLabDetails.createdByName || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-600">Created At:</span> <span className="text-gray-900">{formatDateTime(viewLabDetails.createdAt)}</span></div>
                  <div><span className="font-medium text-gray-600">Updated At:</span> <span className="text-gray-900">{formatDateTime(viewLabDetails.updatedAt)}</span></div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Branding</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Logo URL</span>
                    <input
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={editForm?.labLogo || ''}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, labLogo: e.target.value } : prev))}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileChange}
                    />
                    <button
                      type="button"
                      onClick={triggerLogoUpload}
                      disabled={isUploadingLogo}
                      className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </button>
                    {editForm?.labLogo && (
                      <span className="text-xs text-gray-500">New logo ready to save</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600">No lab details available.</div>
        )}
      </Modal>

      {loading ? (
        <Loader />
      ) : (
        <TableComponent
          data={labs}
          columns={columns}
          noDataMessage="No labs available." />
      )}
    </div>
  );
};

export default LabList;
