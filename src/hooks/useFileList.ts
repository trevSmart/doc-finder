'use client';

import { useState, useEffect } from 'react';
import { FileItem } from '../types/file';

export function useFileList(folderPath: string) {
	const [files, setFiles] = useState<FileItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!folderPath) {
			setFiles([]);
			return;
		}

		const fetchFiles = async () => {
			setLoading(true);
			setError(null);

			try {
				// Crida real a l'API per llistar fitxers
				const response = await fetch(`/api/files?path=${encodeURIComponent(folderPath)}`);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to fetch files');
				}

				const data = await response.json();
				setFiles(data.files);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Error al carregar els fitxers';
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		fetchFiles();
	}, [folderPath]);

	return { files, loading, error };
}
