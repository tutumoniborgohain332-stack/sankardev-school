CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"name" text NOT NULL,
	"reference_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"father_name" text NOT NULL,
	"mother_name" text NOT NULL,
	"permanent_address" text,
	"present_address" text,
	"date_of_birth" text,
	"caste" text,
	"religion" text,
	"class_name" text NOT NULL,
	"section" text,
	"roll_number" text NOT NULL,
	"apaar_id" text NOT NULL,
	"blood_group" text,
	"nationality" text,
	"guardian_name" text,
	"guardian_relation" text,
	"guardian_phone" text,
	"previous_school" text,
	"admission_date" text NOT NULL,
	"photo_url" text,
	"username" text,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"designation" text NOT NULL,
	"qualification" text,
	"subject" text,
	"phone" text,
	"email" text,
	"join_date" text NOT NULL,
	"photo_url" text,
	"username" text,
	"is_headmaster" boolean DEFAULT false NOT NULL,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'photo' NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"category" text,
	"description" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"title_assamese" text,
	"content_assamese" text,
	"category" text,
	"is_important" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial_number" text,
	"class_roll_number" text,
	"student_name" text NOT NULL,
	"father_name" text NOT NULL,
	"mother_name" text NOT NULL,
	"permanent_address" text,
	"present_address" text,
	"pin_code" text,
	"guardian_name" text,
	"guardian_relation" text,
	"date_of_birth" text,
	"age" text,
	"caste" text,
	"religion" text,
	"nationality" text,
	"blood_group" text,
	"previous_school_name" text,
	"previous_school_address" text,
	"previous_class" text,
	"previous_class_result" text,
	"reason_for_leaving" text,
	"applied_for_class" text NOT NULL,
	"apaar_id" text,
	"sibling_name" text,
	"sibling_class" text,
	"sibling_section" text,
	"special_category" text,
	"father_phone" text,
	"mother_phone" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"remarks" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"roll_number" text NOT NULL,
	"student_name" text NOT NULL,
	"class_name" text NOT NULL,
	"section" text,
	"exam_type" text NOT NULL,
	"academic_year" text NOT NULL,
	"subjects" jsonb NOT NULL,
	"total_marks" integer NOT NULL,
	"marks_obtained" integer NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"result" text NOT NULL,
	"rank" integer,
	"remarks" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"date" date NOT NULL,
	"status" text DEFAULT 'present' NOT NULL,
	"class_name" text NOT NULL,
	"section" text,
	"marked_by" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;