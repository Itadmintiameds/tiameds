'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import TemplateSelector from './_components/TemplateSelector'
import TemplatePreview from './_components/TemplatePreview'
import { TemplateId } from './_components/reportTemplates'
import { useLabs } from '@/context/LabContext'
import {
  ReportSettingsPayload,
  ReportRoleSetting,
  SignaturePlacement,
  TextSizePreset,
  SignatureColumns,
} from '@/types/reportSettings'
import {
  getReportSettings,
  saveReportSettings,
  updateReportSettings,
  getReportSignatureUploadUrl,
} from '@/../services/reportServices'

const DEFAULT_DISCLAIMER =
  'This laboratory report is intended for clinical correlation only. Results should be interpreted by a qualified medical professional.'

const DEFAULT_SETTINGS = {
  templateId: 'templateA' as const,
  headerEnabled: true,
  headerRequired: false,
  fontSize: 12,
  textSize: 'Medium' as const,
  textColor: '#111827',
  signaturePlacement: 'bottom-right' as const,
  signatureColumns: 2 as const,
  disclaimerEnabled: true,
  disclaimerText: DEFAULT_DISCLAIMER,
  roles: [
    { role: 'Doctor', displayName: '', designation: '', signatureUrl: '', enabled: true, sortOrder: 0 },
    { role: 'Technician', displayName: '', designation: '', signatureUrl: '', enabled: true, sortOrder: 1 },
  ],
}

const placementOptions: { id: SignaturePlacement; label: string }[] = [
  { id: 'top-right', label: 'Top Right' },
  { id: 'top-left', label: 'Top Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
]

type LocalRole = {
  id: string
  role: string
  displayName: string
  designation: string
  signatureUrl: string
  enabled: boolean
}

const ReportSettingsPage = () => {
  const { currentLab } = useLabs()

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('templateA')
  const [headerEnabled, setHeaderEnabled] = useState(true)
  const [headerRequired, setHeaderRequired] = useState(false)
  const [fontSize, setFontSize] = useState(12)
  const [textSize, setTextSize] = useState<TextSizePreset>('Medium')
  const [signaturePlacement, setSignaturePlacement] = useState<SignaturePlacement>('bottom-right')
  const [signatureColumns, setSignatureColumns] = useState<SignatureColumns>(2)
  const [disclaimerEnabled, setDisclaimerEnabled] = useState(true)
  const [disclaimerText, setDisclaimerText] = useState(DEFAULT_DISCLAIMER)
  const [textColor, setTextColor] = useState('#111827')
  const [roles, setRoles] = useState<LocalRole[]>([
    { id: 'role-1', role: 'Doctor', displayName: '', designation: '', signatureUrl: '', enabled: true },
    { id: 'role-2', role: 'Technician', displayName: '', designation: '', signatureUrl: '', enabled: true },
  ])

  const [settingsExist, setSettingsExist] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingRoleId, setUploadingRoleId] = useState<string | null>(null)
  const signatureFileInputRef = useRef<HTMLInputElement>(null)
  const uploadingForRoleRef = useRef<string | null>(null)

  const applySettings = useCallback((data: {
    templateId: TemplateId
    headerEnabled: boolean
    headerRequired: boolean
    fontSize: number
    textSize: TextSizePreset
    textColor: string
    signaturePlacement: SignaturePlacement
    signatureColumns: SignatureColumns
    disclaimerEnabled: boolean
    disclaimerText: string
    roles: ReportRoleSetting[]
  }) => {
    setSelectedTemplate(data.templateId)
    setHeaderEnabled(data.headerEnabled)
    setHeaderRequired(data.headerRequired)
    setFontSize(data.fontSize)
    setTextSize(data.textSize)
    setTextColor(data.textColor)
    setSignaturePlacement(data.signaturePlacement)
    setSignatureColumns(data.signatureColumns)
    setDisclaimerEnabled(data.disclaimerEnabled)
    setDisclaimerText(data.disclaimerText)
    setRoles(
      data.roles
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((r, i) => ({
          id: r.id ? `db-${r.id}` : `role-${i}`,
          role: r.role,
          displayName: r.displayName,
          designation: r.designation,
          signatureUrl: r.signatureUrl,
          enabled: r.enabled,
        }))
    )
  }, [])

  const fetchSettings = useCallback(async () => {
    if (!currentLab?.id) return
    setIsLoading(true)
    try {
      const data = await getReportSettings(currentLab.id)
      applySettings(data)
      setSettingsExist(true)
    } catch {
      applySettings(DEFAULT_SETTINGS)
      setSettingsExist(false)
    } finally {
      setIsLoading(false)
    }
  }, [currentLab, applySettings])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const buildPayload = (): ReportSettingsPayload => ({
    templateId: selectedTemplate,
    headerEnabled,
    headerRequired,
    fontSize,
    textSize,
    textColor,
    signaturePlacement,
    signatureColumns,
    disclaimerEnabled,
    disclaimerText,
    roles: roles.map((r, i) => ({
      role: r.role,
      displayName: r.displayName,
      designation: r.designation,
      signatureUrl: r.signatureUrl,
      enabled: r.enabled,
      sortOrder: i,
    })),
  })

  const handleSave = async () => {
    if (!currentLab?.id) {
      toast.error('No lab selected')
      return
    }
    setIsSaving(true)
    try {
      const payload = buildPayload()
      if (settingsExist) {
        await updateReportSettings(currentLab.id, payload)
      } else {
        await saveReportSettings(currentLab.id, payload)
        setSettingsExist(true)
      }
      toast.success('Report settings saved successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save report settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    fetchSettings()
    toast.info('Settings reset')
  }

  const previewStyles = useMemo(() => {
    const baseSize = textSize === 'Small' ? 11 : textSize === 'Large' ? 14 : 12
    return { fontSize: `${Math.max(baseSize, fontSize)}px` }
  }, [fontSize, textSize])

  const addRole = () => {
    const id = `role-${Date.now()}`
    setRoles((prev) => [
      ...prev,
      {
        id,
        role: 'New Role',
        displayName: '',
        designation: '',
        signatureUrl: '',
        enabled: true,
      },
    ])
  }

  const removeRole = (id: string) => {
    setRoles((prev) => prev.filter((role) => role.id !== id))
  }

  const moveRole = (id: string, direction: 'up' | 'down') => {
    setRoles((prev) => {
      const index = prev.findIndex((role) => role.id === id)
      if (index < 0) return prev
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  const updateRole = (id: string, patch: Partial<LocalRole>) => {
    setRoles((prev) => prev.map((role) => (role.id === id ? { ...role, ...patch } : role)))
  }

  const triggerSignatureUpload = (roleId: string) => {
    if (!currentLab?.id) {
      toast.error('No lab selected')
      return
    }
    uploadingForRoleRef.current = roleId
    signatureFileInputRef.current?.click()
  }

  const handleSignatureFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const roleId = uploadingForRoleRef.current
    uploadingForRoleRef.current = null
    e.target.value = ''
    if (!file || !roleId || !currentLab?.id) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, etc.).')
      return
    }
    const contentType = file.type || 'application/octet-stream'
    try {
      setUploadingRoleId(roleId)
      const { uploadUrl, fileUrl, headers } = await getReportSignatureUploadUrl(
        currentLab.id,
        file.name,
        contentType
      )
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers:
          headers && Object.keys(headers).length > 0 ? headers : { 'Content-Type': contentType },
      })
      if (!uploadResponse.ok) {
        throw new Error('Upload failed.')
      }
      updateRole(roleId, { signatureUrl: fileUrl })
      toast.success('Signature uploaded successfully.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload signature.')
    } finally {
      setUploadingRoleId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Report Settings</h1>
          <p className="text-xs text-gray-500">Customize report layout, header, and signatures</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isLoading || isSaving}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Template</div>
            <TemplateSelector value={selectedTemplate} onChange={setSelectedTemplate} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Header</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <span className="text-gray-700">Enable Header</span>
                <input type="checkbox" className="h-4 w-4" checked={headerEnabled} onChange={(e) => setHeaderEnabled(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <span className="text-gray-700">Header Required</span>
                <input type="checkbox" className="h-4 w-4" checked={headerRequired} onChange={(e) => setHeaderRequired(e.target.checked)} />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Typography</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="18"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <div className="mt-1 text-[11px] text-gray-500">Selected: {fontSize}px</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Text Size</label>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  value={textSize}
                  onChange={(e) => setTextSize(e.target.value as 'Small' | 'Medium' | 'Large')}
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Text Color</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Signature Placement</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {placementOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSignaturePlacement(option.id)}
                    className={`rounded-md border px-3 py-2 text-xs ${
                      signaturePlacement === option.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <span className="text-gray-700">Signatures per row</span>
                  <select
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                    value={signatureColumns}
                    onChange={(e) => setSignatureColumns(Number(e.target.value) as 2 | 3 | 4)}
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">Disclaimer</div>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                Enabled
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={disclaimerEnabled}
                  onChange={(e) => setDisclaimerEnabled(e.target.checked)}
                />
              </label>
            </div>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              rows={4}
              value={disclaimerText}
              onChange={(e) => setDisclaimerText(e.target.value)}
              placeholder="Enter disclaimer text shown on the report"
              disabled={!disclaimerEnabled}
            />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <input
              ref={signatureFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSignatureFileChange}
            />
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">Roles & Signatures</div>
              <button
                onClick={addRole}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Add Role
              </button>
            </div>
            <div className="space-y-3">
              {roles.map((role, index) => (
                <div key={role.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-semibold text-gray-800">{role.role}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <button
                        onClick={() => moveRole(role.id, 'up')}
                        className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50"
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveRole(role.id, 'down')}
                        className="rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-50"
                        disabled={index === roles.length - 1}
                      >
                        ↓
                      </button>
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        Enabled
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={role.enabled}
                          onChange={(e) => updateRole(role.id, { enabled: e.target.checked })}
                        />
                      </label>
                      <button
                        onClick={() => removeRole(role.id)}
                        className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Role"
                      value={role.role}
                      onChange={(e) => updateRole(role.id, { role: e.target.value })}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={role.displayName}
                      onChange={(e) => updateRole(role.id, { displayName: e.target.value })}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={role.designation}
                      onChange={(e) => updateRole(role.id, { designation: e.target.value })}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                    <div className="flex flex-col gap-2">
                      <label className="block text-[11px] font-medium text-gray-500">Signature</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerSignatureUpload(role.id)}
                          disabled={uploadingRoleId === role.id}
                          className="rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {uploadingRoleId === role.id ? 'Uploading...' : 'Upload'}
                        </button>
                        {role.signatureUrl && (
                          <div className="flex items-center gap-1">
                            <img
                              src={role.signatureUrl}
                              alt="Signature"
                              className="h-8 w-16 rounded border border-gray-200 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => updateRole(role.id, { signatureUrl: '' })}
                              className="text-[10px] text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Live Preview</div>
          <div style={previewStyles}>
            <TemplatePreview
              templateId={selectedTemplate}
              headerEnabled={headerEnabled}
              headerRequired={headerRequired}
              fontSize={fontSize}
              textSize={textSize}
              textColor={textColor}
              signaturePlacement={signaturePlacement}
              signatureColumns={signatureColumns}
              roles={roles}
              disclaimerEnabled={disclaimerEnabled}
              disclaimerText={disclaimerText}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ReportSettingsPage