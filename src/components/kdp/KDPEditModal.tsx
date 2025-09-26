import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { editKdpDataThunk } from '../../redux/slices/kdpFlowSlice';

interface KDPEditModalProps {
  open: boolean;
  onClose: () => void;
  bookIndex: number | null;
  initialData?: {
    title: string;
    description: string;
    keywords: string[];
  } | null;
}

const KDPEditModal: React.FC<KDPEditModalProps> = ({ open, onClose, bookIndex, initialData }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setKeywords((initialData.keywords || []).join(', '));
    }
  }, [initialData, open]);

  if (!open) return null;

  const onSave = async () => {
    if (bookIndex == null) return;
    const payload = {
      book_index: bookIndex,
      data: { title, description, keywords: keywords.split(',').map(k => k.trim()).filter(Boolean) },
    };
    await dispatch(editKdpDataThunk(payload));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded-md bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Edit KDP Data</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="h-32 w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Keywords (comma separated)</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border px-4 py-2">Cancel</button>
          <button onClick={onSave} className="rounded bg-indigo-600 px-4 py-2 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

export default KDPEditModal;


