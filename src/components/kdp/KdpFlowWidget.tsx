import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  generateBookThunk,
  bulkGenerateKdpDataThunk,
  fetchBookQueueThunk,
  openKDPEditModal,
  closeKDPEditModal,
  selectKdpFlow,
  setPolling,
  autoGenerateBooksThunk,
  uploadBulkBooksThunk,
} from '../../redux/slices/kdpFlowSlice';
import KDPEditModal from './KDPEditModal';

const KdpFlowWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const flow = useAppSelector(selectKdpFlow);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!flow.polling) return;
    dispatch(fetchBookQueueThunk());
    const id = setInterval(() => dispatch(fetchBookQueueThunk()), 10000);
    return () => clearInterval(id);
  }, [flow.polling, dispatch]);

  return (
    <div className="mt-8 rounded-md border p-4">
      <h2 className="mb-3 text-xl font-semibold">KDP Book Generation Flow</h2>
      <div className="flex gap-2">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter a prompt" className="flex-1 rounded border px-3 py-2" />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          onClick={() => dispatch(generateBookThunk({ user_prompt: prompt }))}
          disabled={flow.loadingStep === 'generate'}
        >{flow.loadingStep === 'generate' ? 'Generating...' : 'Generate Book'}</button>
        <button
          className="rounded bg-emerald-600 px-4 py-2 text-white"
          onClick={() => dispatch(autoGenerateBooksThunk({ n: 3 }))}
          disabled={flow.loadingStep === 'autoGenerate'}
        >Auto-generate 3</button>
      </div>

      {flow.generated && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-gray-600">Generated books:</div>
          <ul className="list-disc pl-5">
            {flow.generated.books.map(b => (
              <li key={b.id}>{b.title} · {b.niche}</li>
            ))}
          </ul>
        </div>
      )}

      {flow.pendingResult && (
        <div className="mt-4">
          <div className="text-sm">Processed: {flow.pendingResult.processed} | Failed: {flow.pendingResult.failed}</div>
          <button
            className="mt-3 rounded bg-purple-600 px-4 py-2 text-white"
            onClick={() => {
              const ids = flow.generated?.books.map(b => b.id) || [];
              if (ids.length === 0) return;
              dispatch(bulkGenerateKdpDataThunk({ book_ids: ids }));
            }}
            disabled={flow.loadingStep === 'generateKdpData'}
          >{flow.loadingStep === 'generateKdpData' ? 'Generating KDP Data...' : 'Generate KDP Data'}</button>
        </div>
      )}

      {flow.kdpGenerated && (
        <div className="mt-4">
          <div className="text-sm">KDP data generated. You can edit before upload.</div>
          <button
            className="mt-3 rounded bg-gray-800 px-4 py-2 text-white"
            onClick={() => dispatch(setPolling(true))}
          >Start Queue Polling</button>
        </div>
      )}

      {flow.queue && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium">Book Queue ({flow.queue.total})</div>
            <div className="flex items-center gap-2">
              <button
                className="rounded border px-3 py-1"
                onClick={() => dispatch(fetchBookQueueThunk())}
              >Refresh</button>
              <button
                className="rounded bg-sky-600 px-3 py-1 text-white"
                onClick={() => {
                  const reviewIds = flow.queue!.book_queue.filter(b => b.status === 'review').map(b => b.id);
                  if (reviewIds.length === 0) return;
                  dispatch(uploadBulkBooksThunk({ book_ids: reviewIds }));
                }}
              >Bulk Upload Review</button>
            </div>
          </div>
          <div className="space-y-2">
            {flow.queue.book_queue.map((b, idx) => (
              <div key={b.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-gray-600">{b.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${b.status === 'uploaded' ? 'bg-green-100 text-green-700' : b.status === 'review' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{b.status}</span>
                  <button
                    className="rounded border px-2 py-1 text-sm"
                    onClick={() => dispatch(openKDPEditModal({ index: idx, data: b.kdpData || { title: b.title, description: '', keywords: [] } }))}
                  >Edit KDP</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <KDPEditModal
        open={flow.isKDPEditModalOpen}
        onClose={() => dispatch(closeKDPEditModal())}
        bookIndex={flow.kdpEditIndex}
        initialData={flow.kdpEditData || undefined}
      />
    </div>
  );
};

export default KdpFlowWidget;


