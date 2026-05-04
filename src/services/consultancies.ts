import pb from '@/lib/pocketbase/client'

export const getConsultancies = () =>
  pb.collection('consultancies').getFullList({ sort: '-created' })
export const getConsultancy = (id: string) => pb.collection('consultancies').getOne(id)
export const createConsultancy = (data: any) => pb.collection('consultancies').create(data)
export const updateConsultancy = (id: string, data: any) =>
  pb.collection('consultancies').update(id, data)
export const deleteConsultancy = (id: string) => pb.collection('consultancies').delete(id)

export const generateGoldenTasks = (data: { fato?: string; dor?: string; desejo?: string }) =>
  pb.send('/backend/v1/generate-golden-tasks', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const generateSwot = (data: { fato?: string; dor?: string; desejo?: string }) =>
  pb.send('/backend/v1/generate-swot', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
