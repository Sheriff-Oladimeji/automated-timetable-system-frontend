import type {
  Token,
  UserOut,
  FacultyOut,
  FacultyCreate,
  DepartmentOut,
  DepartmentCreate,
  CourseOut,
  CourseCreate,
  CourseUpdate,
  LecturerOut,
  LecturerCreate,
  LecturerUpdate,
  LecturerCourseCreate,
  LecturerCourseOut,
  RoomOut,
  RoomCreate,
  RoomUpdate,
  TimeSlotOut,
  TimeSlotCreate,
  UnavailabilityCreate,
  UnavailabilityOut,
  ConstraintConfig,
  SchedulerRunOut,
  ScheduleEntryOut,
  ManualAdjustRequest,
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Request failed' }))
    const detail = body.detail
    const message =
      typeof detail === 'string'
        ? detail
        : typeof detail?.message === 'string'
          ? detail.message
          : JSON.stringify(detail) ?? 'Request failed'
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── AUTH ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<Token>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<UserOut>('/auth/me'),

  registerAdmin: (email: string, password: string) =>
    request<{ message: string; id: number }>('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerStudent: (data: {
    email: string
    password: string
    matric_number: string
    department_id: number
    level: number
  }) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── FACULTIES ────────────────────────────────────────────────────────────

export const facultiesApi = {
  list: () => request<FacultyOut[]>('/resources/faculties'),

  create: (data: FacultyCreate) =>
    request<FacultyOut>('/resources/faculties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/resources/faculties/${id}`, { method: 'DELETE' }),
}

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────

export const departmentsApi = {
  list: () => request<DepartmentOut[]>('/resources/departments'),

  create: (data: DepartmentCreate) =>
    request<DepartmentOut>('/resources/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/resources/departments/${id}`, { method: 'DELETE' }),
}

// ─── COURSES ──────────────────────────────────────────────────────────────

export const coursesApi = {
  list: (params?: { department_id?: number; level?: number }) => {
    const q = new URLSearchParams()
    if (params?.department_id) q.set('department_id', String(params.department_id))
    if (params?.level) q.set('level', String(params.level))
    const qs = q.toString()
    return request<CourseOut[]>(`/resources/courses${qs ? `?${qs}` : ''}`)
  },

  create: (data: CourseCreate) =>
    request<CourseOut>('/resources/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CourseUpdate) =>
    request<CourseOut>(`/resources/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/resources/courses/${id}`, { method: 'DELETE' }),
}

// ─── LECTURERS ────────────────────────────────────────────────────────────

export const lecturersApi = {
  list: (departmentId?: number) => {
    const qs = departmentId ? `?department_id=${departmentId}` : ''
    return request<LecturerOut[]>(`/resources/lecturers${qs}`)
  },

  create: (data: LecturerCreate) =>
    request<LecturerOut>('/resources/lecturers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: LecturerUpdate) =>
    request<LecturerOut>(`/resources/lecturers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/resources/lecturers/${id}`, { method: 'DELETE' }),

  listAssignments: (lecturerId?: number) => {
    const qs = lecturerId ? `?lecturer_id=${lecturerId}` : ''
    return request<LecturerCourseOut[]>(`/resources/lecturer-courses${qs}`)
  },

  assignCourse: (data: LecturerCourseCreate) =>
    request<LecturerCourseOut>('/resources/lecturer-courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  unassignCourse: (assignmentId: number) =>
    request<void>(`/resources/lecturer-courses/${assignmentId}`, {
      method: 'DELETE',
    }),
}

// ─── ROOMS ────────────────────────────────────────────────────────────────

export const roomsApi = {
  list: (roomType?: string) => {
    const qs = roomType ? `?room_type=${roomType}` : ''
    return request<RoomOut[]>(`/resources/rooms${qs}`)
  },

  create: (data: RoomCreate) =>
    request<RoomOut>('/resources/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: RoomUpdate) =>
    request<RoomOut>(`/resources/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/resources/rooms/${id}`, { method: 'DELETE' }),
}

// ─── TIME SLOTS ───────────────────────────────────────────────────────────

export const timeSlotsApi = {
  list: () => request<TimeSlotOut[]>('/resources/timeslots'),

  create: (data: TimeSlotCreate) =>
    request<TimeSlotOut>('/resources/timeslots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/resources/timeslots/${id}`, { method: 'DELETE' }),
}

// ─── CONSTRAINTS ──────────────────────────────────────────────────────────

export const constraintsApi = {
  listUnavailability: (lecturerId?: number) => {
    const qs = lecturerId ? `?lecturer_id=${lecturerId}` : ''
    return request<UnavailabilityOut[]>(`/constraints/unavailability${qs}`)
  },

  addUnavailability: (data: UnavailabilityCreate) =>
    request<UnavailabilityOut>('/constraints/unavailability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeUnavailability: (id: number) =>
    request<void>(`/constraints/unavailability/${id}`, { method: 'DELETE' }),

  getConfig: () => request<ConstraintConfig>('/constraints/config'),

  updateConfig: (data: ConstraintConfig) =>
    request<ConstraintConfig>('/constraints/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ─── SCHEDULER ────────────────────────────────────────────────────────────

export const schedulerApi = {
  trigger: () => request<SchedulerRunOut>('/scheduler/run', { method: 'POST' }),

  getStatus: (runId: number) =>
    request<SchedulerRunOut>(`/scheduler/status/${runId}`),

  listRuns: () => request<SchedulerRunOut[]>('/scheduler/runs'),
}

// ─── TIMETABLE ────────────────────────────────────────────────────────────

export const timetableApi = {
  getEntries: (runId: number) =>
    request<ScheduleEntryOut[]>(`/timetable/${runId}`),

  adjustEntry: (entryId: number, data: ManualAdjustRequest) =>
    request<ScheduleEntryOut>(`/timetable/entry/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  publish: (runId: number) =>
    request<void>(`/timetable/${runId}/publish`, { method: 'POST' }),

  unpublish: (runId: number) =>
    request<void>(`/timetable/${runId}/unpublish`, { method: 'POST' }),
}

// ─── LECTURER (self-service) ──────────────────────────────────────────────

export const myScheduleApi = {
  getSchedule: (day?: string) => {
    const qs = day ? `?day=${day}` : ''
    return request<ScheduleEntryOut[]>(`/lecturer/schedule${qs}`)
  },

  getUnavailability: () =>
    request<UnavailabilityOut[]>('/lecturer/unavailability'),

  addUnavailability: (data: UnavailabilityCreate) =>
    request<UnavailabilityOut>('/lecturer/unavailability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeUnavailability: (id: number) =>
    request<void>(`/lecturer/unavailability/${id}`, { method: 'DELETE' }),
}

// ─── STUDENT (self-service) ───────────────────────────────────────────────

export const studentApi = {
  getTimetable: (params?: { department_id?: number; level?: number; day?: string }) => {
    const q = new URLSearchParams()
    if (params?.department_id) q.set('department_id', String(params.department_id))
    if (params?.level) q.set('level', String(params.level))
    if (params?.day) q.set('day', params.day)
    const qs = q.toString()
    return request<ScheduleEntryOut[]>(`/student/timetable${qs ? `?${qs}` : ''}`)
  },

  getDepartments: () => request<DepartmentOut[]>('/student/departments'),
}
