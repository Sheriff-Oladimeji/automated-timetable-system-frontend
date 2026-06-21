// TypeScript types mirroring the FastAPI Pydantic schemas

export type UserRole = 'admin' | 'lecturer' | 'student'
export type CourseType = 'theory' | 'lab'
export type RoomType = 'lecture_hall' | 'seminar_room' | 'laboratory'
export type SolverStatus = 'pending' | 'running' | 'optimal' | 'feasible' | 'infeasible' | 'failed'
export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

// Auth
export interface Token {
  access_token: string
  token_type: string
  role: UserRole
}

export interface UserOut {
  id: number
  email: string
  role: UserRole
  is_active: boolean
}

// Resources
export interface FacultyOut {
  id: number
  name: string
  code: string
}

export interface FacultyCreate {
  name: string
  code: string
}

export interface DepartmentOut {
  id: number
  faculty_id: number
  name: string
  code: string
}

export interface DepartmentCreate {
  faculty_id: number
  name: string
  code: string
}

export interface CourseOut {
  id: number
  department_id: number
  code: string
  name: string
  level: number
  course_type: CourseType
  hours_per_week: number
  enrolled_count: number
}

export interface CourseCreate {
  department_id: number
  code: string
  name: string
  level: number
  course_type: CourseType
  hours_per_week: number
  enrolled_count: number
}

export interface CourseUpdate {
  name?: string
  hours_per_week?: number
  enrolled_count?: number
}

export interface LecturerOut {
  id: number
  department_id: number
  title: string
  first_name: string
  last_name: string
  email: string
}

export interface LecturerCreate {
  department_id: number
  title: string
  first_name: string
  last_name: string
  email: string
}

export interface LecturerUpdate {
  title?: string
  first_name?: string
  last_name?: string
}

export interface LecturerCourseCreate {
  lecturer_id: number
  course_id: number
}

export interface LecturerCourseOut {
  id: number
  lecturer_id: number
  course_id: number
}

export interface RoomOut {
  id: number
  name: string
  room_type: RoomType
  capacity: number
  is_available: boolean
}

export interface RoomCreate {
  name: string
  room_type: RoomType
  capacity: number
}

export interface RoomUpdate {
  name?: string
  capacity?: number
  is_available?: boolean
}

export interface TimeSlotOut {
  id: number
  day: Day
  start_time: string
  end_time: string
  duration_minutes: number
}

export interface TimeSlotCreate {
  day: Day
  start_time: string
  end_time: string
  duration_minutes: number
}

// Constraints
export interface UnavailabilityCreate {
  lecturer_id: number
  time_slot_id: number
  reason?: string
}

export interface UnavailabilityOut {
  id: number
  lecturer_id: number
  time_slot_id: number
  reason: string | null
  created_at: string
}

export interface ConstraintConfig {
  unavailability_penalty: number
  back_to_back_penalty: number
  spread_sessions_penalty: number
  room_capacity_penalty: number
  time_limit_seconds: number
}

// Scheduling
export interface SchedulerRunOut {
  id: number
  created_at: string
  status: SolverStatus
  solver_status: string | null
  objective_value: number | null
  computation_seconds: number | null
  is_published: boolean
  notes: string | null
}

export interface ScheduleEntryOut {
  id: number
  run_id: number
  course_id: number
  lecturer_id: number
  room_id: number
  time_slot_id: number
  is_manually_adjusted: boolean
  course: CourseOut
  lecturer: LecturerOut
  room: RoomOut
  time_slot: TimeSlotOut
}

export interface ManualAdjustRequest {
  room_id: number
  time_slot_id: number
}
