'use client'

import { useState } from 'react'
import { useSettings } from '../../contexts/SettingsContext'

export default function SettingsPage() {
  const { settings, updateProfile, updateDocumentSources, updateSearchSettings, updateLanguageAndDates } = useSettings()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<Record<string, string>>({})

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValues(prev => ({ ...prev, [field]: currentValue }))
  }

  const handleSave = (field: string, section: 'profile' | 'documentSources' | 'languageAndDates') => {
    const value = tempValues[field]
    if (value !== undefined) {
      if (section === 'profile') {
        updateProfile({ [field]: value })
      } else if (section === 'documentSources') {
        updateDocumentSources({ [field]: value })
      } else if (section === 'languageAndDates') {
        updateLanguageAndDates({ [field]: value })
      }
    }
    setEditingField(null)
    setTempValues(prev => {
      const newValues = { ...prev }
      delete newValues[field]
      return newValues
    })
  }

  const handleCancel = (field: string) => {
    setEditingField(null)
    setTempValues(prev => {
      const newValues = { ...prev }
      delete newValues[field]
      return newValues
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-16 sm:space-y-20">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Profile</h2>
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
                This information will be displayed publicly so be careful what you share.
              </p>

              <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                <div className="py-6 sm:flex">
                  <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-white">Full name</dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    {editingField === 'fullName' ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={tempValues.fullName || settings.profile.fullName}
                          onChange={(e) => setTempValues(prev => ({ ...prev, fullName: e.target.value }))}
                          className="flex-1 rounded-md bg-white dark:bg-white/5 py-1.5 px-3 text-sm text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSave('fullName', 'profile')}
                          className="px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel('fullName')}
                          className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-gray-900 dark:text-gray-300">{settings.profile.fullName}</div>
                        <button
                          type="button"
                          onClick={() => handleEdit('fullName', settings.profile.fullName)}
                          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Update
                        </button>
                      </>
                    )}
                  </dd>
                </div>
                <div className="py-6 sm:flex">
                  <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-white">
                    Email address
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    {editingField === 'email' ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="email"
                          value={tempValues.email || settings.profile.email}
                          onChange={(e) => setTempValues(prev => ({ ...prev, email: e.target.value }))}
                          className="flex-1 rounded-md bg-white dark:bg-white/5 py-1.5 px-3 text-sm text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSave('email', 'profile')}
                          className="px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel('email')}
                          className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-gray-900 dark:text-gray-300">{settings.profile.email}</div>
                        <button
                          type="button"
                          onClick={() => handleEdit('email', settings.profile.email)}
                          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Update
                        </button>
                      </>
                    )}
                  </dd>
                </div>
                <div className="py-6 sm:flex">
                  <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-white">Title</dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    {editingField === 'title' ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={tempValues.title || settings.profile.title}
                          onChange={(e) => setTempValues(prev => ({ ...prev, title: e.target.value }))}
                          className="flex-1 rounded-md bg-white dark:bg-white/5 py-1.5 px-3 text-sm text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSave('title', 'profile')}
                          className="px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel('title')}
                          className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-gray-900 dark:text-gray-300">{settings.profile.title}</div>
                        <button
                          type="button"
                          onClick={() => handleEdit('title', settings.profile.title)}
                          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Update
                        </button>
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Document Sources</h2>
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">Connect document sources to your account.</p>

              <ul
                role="list"
                className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5"
              >
                <li className="flex justify-between gap-x-6 py-6">
                  <div className="font-medium text-gray-900 dark:text-white">Google Drive</div>
                  <button
                    type="button"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Update
                  </button>
                </li>
                <li className="flex justify-between gap-x-6 py-6">
                  <div className="font-medium text-gray-900 dark:text-white">Dropbox</div>
                  <button
                    type="button"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Update
                  </button>
                </li>
                <li className="py-6">
                  <div className="flex items-center justify-between gap-x-6">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-2">Local folder</div>
                      {editingField === 'localFolder' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempValues.localFolder || settings.documentSources.localFolder}
                            onChange={(e) => setTempValues(prev => ({ ...prev, localFolder: e.target.value }))}
                            placeholder="/path/to/documents"
                            className="flex-1 rounded-md bg-white dark:bg-white/5 py-1.5 px-3 text-sm text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSave('localFolder', 'documentSources')}
                            className="px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel('localFolder')}
                            className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={settings.documentSources.localFolder}
                            placeholder="/path/to/documents"
                            readOnly
                            className="flex-1 rounded-md bg-gray-50 dark:bg-gray-800/50 py-1.5 px-3 text-sm text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleEdit('localFolder', settings.documentSources.localFolder)}
                            className="px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Update
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              </ul>

              <div className="flex border-t border-gray-100 pt-6 dark:border-white/5">
                <button
                  type="button"
                  className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <span aria-hidden="true">+</span> Add another source
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Search Settings</h2>
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">Configure your document search preferences.</p>

              <ul
                role="list"
                className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5"
              >
                <li className="flex justify-between gap-x-6 py-6">
                  <div className="font-medium text-gray-900 dark:text-white">Full-text search</div>
                  <button
                    type="button"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Configure
                  </button>
                </li>
                <li className="flex justify-between gap-x-6 py-6">
                  <div className="font-medium text-gray-900 dark:text-white">AI-powered search</div>
                  <button
                    type="button"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Configure
                  </button>
                </li>
                <li className="flex justify-between gap-x-6 py-6">
                  <div className="font-medium text-gray-900 dark:text-white">Show folders</div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.searchSettings.showFolders ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.searchSettings.showFolders ? 'translate-x-6' : 'translate-x-1'}`} />
                    <input
                      checked={settings.searchSettings.showFolders}
                      onChange={(e) => updateSearchSettings({ showFolders: e.target.checked })}
                      name="show-folders"
                      type="checkbox"
                      aria-label="Show folders"
                      className="absolute inset-0 appearance-none"
                    />
                  </div>
                </li>
              </ul>

              <div className="flex border-t border-gray-100 pt-6 dark:border-white/5">
                <button
                  type="button"
                  className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <span aria-hidden="true">+</span> Add search filter
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Language and dates</h2>
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
                Choose what language and date format to use throughout your account.
              </p>

              <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                <div className="py-6 sm:flex">
                  <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-white">Language</dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-300">English</div>
                    <button
                      type="button"
                      className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Update
                    </button>
                  </dd>
                </div>
                <div className="py-6 sm:flex">
                  <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-white">
                    Date format
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-300">DD-MM-YYYY</div>
                    <button
                      type="button"
                      className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Update
                    </button>
                  </dd>
                </div>
                <div className="flex pt-6">
                  <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-white">
                    Automatic timezone
                  </dt>
                  <dd className="flex flex-auto items-center justify-end">
                    <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-gray-200 p-px inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
                      <span className="size-4 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5" />
                      <input
                        defaultChecked
                        name="automatic-timezone"
                        type="checkbox"
                        aria-label="Automatic timezone"
                        className="absolute inset-0 appearance-none focus:outline-hidden"
                      />
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
      </div>
    </div>
  )
}
