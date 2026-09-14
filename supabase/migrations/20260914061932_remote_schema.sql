ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "service_role";

REVOKE ALL ON SCHEMA "public" FROM "anon";

REVOKE ALL ON SCHEMA "public" FROM "authenticated";

REVOKE ALL ON SCHEMA "public" FROM "pg_database_owner";

REVOKE ALL ON SCHEMA "public" FROM "service_role";

COMMENT ON SCHEMA "public" IS NULL;

CREATE TABLE "public"."__EFMigrationsHistory" (
  "MigrationId"    character varying(150) NOT NULL,
  "ProductVersion" character varying(32)  NOT NULL,
  CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

CREATE TABLE "public"."announcements" (
  "id"           uuid                     NOT NULL,
  "title"        text                     NOT NULL,
  "body"         text                     NOT NULL,
  "department"   text,
  "published_at" timestamp with time zone NOT NULL,
  "created_by"   uuid,
  "created_at"   timestamp with time zone NOT NULL,
  "updated_at"   timestamp with time zone NOT NULL,
  CONSTRAINT "PK_announcements" PRIMARY KEY (id)
);

ALTER TABLE "public"."announcements"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."announcements"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_accounts" (
  "id"            uuid                     NOT NULL,
  "email"         text                     NOT NULL,
  "password_hash" text                     NOT NULL,
  "full_name"     text                     NOT NULL,
  "is_active"     boolean                  NOT NULL,
  "created_at"    timestamp with time zone NOT NULL,
  "updated_at"    timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_accounts" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_accounts"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_accounts"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_admin_grants" (
  "id"         uuid                     NOT NULL,
  "user_id"    uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_admin_grants" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_admin_grants"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_admin_grants"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_document_templates" (
  "id"                uuid                     NOT NULL,
  "service_id"        uuid                     NOT NULL,
  "template_file_key" text                     NOT NULL,
  "field_config_json" jsonb                    NOT NULL,
  "created_at"        timestamp with time zone NOT NULL,
  "updated_at"        timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_document_templates" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_document_templates"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_document_templates"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_form_schemas" (
  "id"                   uuid                     NOT NULL,
  "document_template_id" uuid                     NOT NULL,
  "version"              integer                  NOT NULL,
  "fields_json"          jsonb                    NOT NULL,
  "created_at"           timestamp with time zone NOT NULL,
  "updated_at"           timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_form_schemas" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_form_schemas"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_form_schemas"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_generated_documents" (
  "id"            uuid                     NOT NULL,
  "submission_id" uuid                     NOT NULL,
  "file_key"      text                     NOT NULL,
  "created_at"    timestamp with time zone NOT NULL,
  "updated_at"    timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_generated_documents" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_generated_documents"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_generated_documents"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_services" (
  "id"          uuid                     NOT NULL,
  "name"        text                     NOT NULL,
  "description" text,
  "category"    text,
  "is_active"   boolean                  NOT NULL,
  "created_at"  timestamp with time zone NOT NULL,
  "updated_at"  timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_services" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_services"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_services"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_submissions" (
  "id"                  uuid                     NOT NULL,
  "client_account_id"   uuid                     NOT NULL,
  "service_id"          uuid                     NOT NULL,
  "form_schema_version" integer                  NOT NULL,
  "responses_json"      jsonb                    NOT NULL,
  "status"              text                     NOT NULL,
  "created_at"          timestamp with time zone NOT NULL,
  "updated_at"          timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_submissions" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_submissions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_submissions"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_subscriptions" (
  "id"                uuid                     NOT NULL,
  "client_account_id" uuid                     NOT NULL,
  "plan"              text                     NOT NULL,
  "status"            text                     NOT NULL,
  "activated_at"      timestamp with time zone NOT NULL,
  "expires_at"        timestamp with time zone,
  "voucher_code_id"   uuid,
  "created_at"        timestamp with time zone NOT NULL,
  "updated_at"        timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_subscriptions" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_subscriptions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_subscriptions"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."client_portal_voucher_codes" (
  "id"                            uuid                     NOT NULL,
  "code"                          text                     NOT NULL,
  "plan_grants"                   text                     NOT NULL,
  "duration_days"                 integer,
  "voucher_expires_at"            timestamp with time zone,
  "is_used"                       boolean                  NOT NULL,
  "redeemed_by_client_account_id" uuid,
  "redeemed_at"                   timestamp with time zone,
  "created_by_user_id"            uuid                     NOT NULL,
  "created_at"                    timestamp with time zone NOT NULL,
  "updated_at"                    timestamp with time zone NOT NULL,
  CONSTRAINT "PK_client_portal_voucher_codes" PRIMARY KEY (id)
);

ALTER TABLE "public"."client_portal_voucher_codes"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_voucher_codes"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."departments" (
  "id"         uuid                     NOT NULL,
  "name"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_departments" PRIMARY KEY (id)
);

ALTER TABLE "public"."departments"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."departments"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."document_requests" (
  "id"                             uuid                     NOT NULL,
  "tracking_number"                text                     NOT NULL,
  "employee_id"                    uuid                     NOT NULL,
  "title"                          text                     NOT NULL,
  "note"                           text                     NOT NULL,
  "document_link"                  text,
  "file_object_key"                text,
  "file_url"                       text,
  "file_name"                      text,
  "status"                         text                     NOT NULL,
  "ea_decided_by_employee_id"      uuid,
  "ea_decision_notes"              text,
  "ea_decided_at"                  timestamp with time zone,
  "partner_decided_by_employee_id" uuid,
  "partner_decision_notes"         text,
  "partner_decided_at"             timestamp with time zone,
  "created_at"                     timestamp with time zone NOT NULL,
  "updated_at"                     timestamp with time zone NOT NULL,
  "deadline_date"                  timestamp with time zone,
  "deleted_at"                     timestamp with time zone,
  "is_deleted"                     boolean                  NOT NULL DEFAULT false,
  "is_archived_by_partner"         boolean                  NOT NULL DEFAULT false,
  "partner_archived_at"            timestamp with time zone,
  CONSTRAINT "PK_document_requests" PRIMARY KEY (id)
);

ALTER TABLE "public"."document_requests"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."document_requests"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."gws_accounts" (
  "id"           uuid                     NOT NULL,
  "name"         text                     NOT NULL,
  "max_capacity" integer                  NOT NULL,
  "created_at"   timestamp with time zone NOT NULL,
  "updated_at"   timestamp with time zone NOT NULL,
  CONSTRAINT "PK_gws_accounts" PRIMARY KEY (id)
);

ALTER TABLE "public"."gws_accounts"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."gws_accounts"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_employee_categories" (
  "id"         uuid                     NOT NULL,
  "name"       text                     NOT NULL,
  "code"       integer                  NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_employee_categories" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_employee_categories"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_employee_categories"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_employee_leave_credits" (
  "id"            uuid                     NOT NULL,
  "employee_id"   uuid                     NOT NULL,
  "leave_type_id" uuid                     NOT NULL,
  "credits"       numeric                  NOT NULL,
  "created_at"    timestamp with time zone NOT NULL,
  "updated_at"    timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_employee_leave_credits" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_employee_leave_credits"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_employee_leave_credits"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_employees" (
  "id"                       uuid                     NOT NULL,
  "company_id"               text                     NOT NULL,
  "category_id"              uuid                     NOT NULL,
  "firstname"                text                     NOT NULL,
  "middlename"               text,
  "lastname"                 text                     NOT NULL,
  "age"                      integer                  NOT NULL,
  "sex"                      text                     NOT NULL,
  "bday"                     timestamp with time zone NOT NULL,
  "nationality"              text                     NOT NULL,
  "department"               text                     NOT NULL,
  "officeposition"           text                     NOT NULL,
  "personalemail"            text,
  "companyemail"             text,
  "startdate"                timestamp with time zone NOT NULL,
  "status"                   text                     NOT NULL,
  "user_id"                  uuid,
  "created_at"               timestamp with time zone NOT NULL,
  "updated_at"               timestamp with time zone NOT NULL,
  "mobile_number"            text,
  "emergency_contact_name"   text,
  "emergency_contact_number" text,
  CONSTRAINT "PK_hr_employees" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_employees"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_employees"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_leave_approvers" (
  "id"                   uuid                     NOT NULL,
  "department"           text                     NOT NULL,
  "approver_employee_id" uuid                     NOT NULL,
  "created_at"           timestamp with time zone NOT NULL,
  "updated_at"           timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_leave_approvers" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_leave_approvers"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_leave_approvers"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_leave_notification_settings" (
  "id"             uuid                     NOT NULL,
  "smtp_sender_id" uuid                     NOT NULL,
  "created_at"     timestamp with time zone NOT NULL,
  "updated_at"     timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_leave_notification_settings" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_leave_notification_settings"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_leave_notification_settings"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_leave_requests" (
  "id"                                uuid                     NOT NULL,
  "employee_id"                       uuid                     NOT NULL,
  "leave_type_id"                     uuid                     NOT NULL,
  "start_date"                        timestamp with time zone NOT NULL,
  "end_date"                          timestamp with time zone NOT NULL,
  "days"                              numeric                  NOT NULL,
  "reason"                            text                     NOT NULL,
  "status"                            text                     NOT NULL,
  "decided_by_employee_id"            uuid,
  "decision_notes"                    text,
  "decided_at"                        timestamp with time zone,
  "created_at"                        timestamp with time zone NOT NULL,
  "updated_at"                        timestamp with time zone NOT NULL,
  "retraction_decided_at"             timestamp with time zone,
  "retraction_decided_by_employee_id" uuid,
  "retraction_decision_notes"         text,
  "retraction_reason"                 text,
  "retraction_requested_at"           timestamp with time zone,
  "is_paid"                           boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "PK_hr_leave_requests" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_leave_requests"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_leave_requests"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_leave_types" (
  "id"                          uuid                     NOT NULL,
  "name"                        text                     NOT NULL,
  "default_credits"             numeric                  NOT NULL,
  "created_at"                  timestamp with time zone NOT NULL,
  "updated_at"                  timestamp with time zone NOT NULL,
  "requires_medical_after_days" integer,
  CONSTRAINT "PK_hr_leave_types" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_leave_types"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_leave_types"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_medical_certificates" (
  "id"                      uuid                     NOT NULL,
  "employee_id"             uuid                     NOT NULL,
  "leave_request_id"        uuid                     NOT NULL,
  "status"                  text                     NOT NULL,
  "drive_file_id"           text,
  "drive_file_url"          text,
  "uploaded_at"             timestamp with time zone,
  "verified_by_employee_id" uuid,
  "verification_notes"      text,
  "verified_at"             timestamp with time zone,
  "created_at"              timestamp with time zone NOT NULL,
  "updated_at"              timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_medical_certificates" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_medical_certificates"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_medical_certificates"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_overtime_partners" (
  "id"                  uuid                     NOT NULL,
  "department"          text                     NOT NULL,
  "partner_employee_id" uuid                     NOT NULL,
  "created_at"          timestamp with time zone NOT NULL,
  "updated_at"          timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_overtime_partners" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_overtime_partners"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_overtime_partners"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_overtime_requests" (
  "id"                             uuid                     NOT NULL,
  "employee_id"                    uuid                     NOT NULL,
  "date"                           timestamp with time zone NOT NULL,
  "start_time"                     time without time zone   NOT NULL,
  "end_time"                       time without time zone   NOT NULL,
  "hours"                          double precision         NOT NULL,
  "reason"                         text                     NOT NULL,
  "status"                         text                     NOT NULL,
  "dept_decided_by_employee_id"    uuid,
  "dept_decision_notes"            text,
  "dept_decided_at"                timestamp with time zone,
  "partner_decided_by_employee_id" uuid,
  "partner_decision_notes"         text,
  "partner_decided_at"             timestamp with time zone,
  "created_at"                     timestamp with time zone NOT NULL,
  "updated_at"                     timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_overtime_requests" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_overtime_requests"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_overtime_requests"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_undertime_requests" (
  "id"                     uuid                     NOT NULL,
  "employee_id"            uuid                     NOT NULL,
  "date"                   timestamp with time zone NOT NULL,
  "start_time"             time without time zone   NOT NULL,
  "end_time"               time without time zone   NOT NULL,
  "hours"                  double precision         NOT NULL,
  "reason"                 text                     NOT NULL,
  "status"                 text                     NOT NULL,
  "decided_by_employee_id" uuid,
  "decision_notes"         text,
  "decided_at"             timestamp with time zone,
  "created_at"             timestamp with time zone NOT NULL,
  "updated_at"             timestamp with time zone NOT NULL,
  CONSTRAINT "PK_hr_undertime_requests" PRIMARY KEY (id)
);

ALTER TABLE "public"."hr_undertime_requests"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hr_undertime_requests"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."intake_full_access_grants" (
  "id"         uuid                     NOT NULL,
  "company_id" text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_intake_full_access_grants" PRIMARY KEY (id)
);

ALTER TABLE "public"."intake_full_access_grants"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."intake_full_access_grants"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."intake_groups" (
  "id"               uuid                     NOT NULL,
  "category"         text                     NOT NULL,
  "name"             text                     NOT NULL,
  "recipient_emails" text                     NOT NULL,
  "sort_order"       integer                  NOT NULL,
  "created_at"       timestamp with time zone NOT NULL,
  "updated_at"       timestamp with time zone NOT NULL,
  CONSTRAINT "PK_intake_groups" PRIMARY KEY (id)
);

ALTER TABLE "public"."intake_groups"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."intake_groups"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."intake_services" (
  "id"         uuid                     NOT NULL,
  "group_id"   uuid                     NOT NULL,
  "name"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_intake_services" PRIMARY KEY (id)
);

ALTER TABLE "public"."intake_services"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."intake_services"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."intake_submission_services" (
  "id"            uuid                     NOT NULL,
  "submission_id" uuid                     NOT NULL,
  "service_id"    uuid                     NOT NULL,
  "created_at"    timestamp with time zone NOT NULL,
  "updated_at"    timestamp with time zone NOT NULL,
  CONSTRAINT "PK_intake_submission_services" PRIMARY KEY (id)
);

ALTER TABLE "public"."intake_submission_services"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."intake_submission_services"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."intake_submissions" (
  "id"                            uuid                     NOT NULL,
  "tracking_number"               text                     NOT NULL,
  "client_type"                   text                     NOT NULL,
  "client_name"                   text                     NOT NULL,
  "industry"                      text,
  "address"                       text                     NOT NULL,
  "country"                       text,
  "number_of_employees"           text,
  "contact_person"                text                     NOT NULL,
  "designation"                   text                     NOT NULL,
  "contact_email"                 text,
  "contact_phone"                 text,
  "supporting_document_url"       text,
  "status"                        text                     NOT NULL,
  "created_at"                    timestamp with time zone NOT NULL,
  "updated_at"                    timestamp with time zone NOT NULL,
  "client_concerns"               text,
  "consultation_date"             timestamp with time zone NOT NULL DEFAULT '-infinity'::timestamp WITH time zone,
  "consultation_preference"       text                     NOT NULL DEFAULT ''::text,
  "how_did_you_find_us"           text                     NOT NULL DEFAULT ''::text,
  "preferred_time_slots"          text,
  "supporting_document_file_name" text,
  CONSTRAINT "PK_intake_submissions" PRIMARY KEY (id)
);

ALTER TABLE "public"."intake_submissions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."intake_submissions"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."it_app_passwords" (
  "id"             uuid                     NOT NULL,
  "gws_account_id" uuid                     NOT NULL,
  "app_password"   text                     NOT NULL,
  "month"          integer                  NOT NULL,
  "year"           integer                  NOT NULL,
  "notes"          text,
  "created_at"     timestamp with time zone NOT NULL,
  "updated_at"     timestamp with time zone NOT NULL,
  CONSTRAINT "PK_it_app_passwords" PRIMARY KEY (id)
);

ALTER TABLE "public"."it_app_passwords"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."it_app_passwords"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."it_asset_history" (
  "id"                  uuid                     NOT NULL,
  "asset_id"            uuid                     NOT NULL,
  "part_component"      text                     NOT NULL,
  "serial_number"       text,
  "date_purchased"      timestamp with time zone,
  "date_of_replacement" timestamp with time zone NOT NULL,
  "notes"               text,
  "created_at"          timestamp with time zone NOT NULL,
  "updated_at"          timestamp with time zone NOT NULL,
  CONSTRAINT "PK_it_asset_history" PRIMARY KEY (id)
);

ALTER TABLE "public"."it_asset_history"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."it_asset_history"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."it_assets" (
  "id"              uuid                     NOT NULL,
  "asset_tag"       text                     NOT NULL,
  "device_name"     text                     NOT NULL,
  "type"            text                     NOT NULL,
  "brand"           text                     NOT NULL,
  "model"           text                     NOT NULL,
  "price"           numeric(12,2)            NOT NULL,
  "status"          text                     NOT NULL,
  "condition"       text                     NOT NULL,
  "assigned_to"     text,
  "previous_user"   text,
  "serial_number"   text                     NOT NULL,
  "department"      text,
  "has_mouse"       boolean                  NOT NULL,
  "has_keyboard"    boolean                  NOT NULL,
  "has_monitor"     boolean                  NOT NULL,
  "mouse_serial"    text,
  "keyboard_serial" text,
  "monitor_serial"  text,
  "remarks"         text,
  "created_by_name" text                     NOT NULL,
  "purchase_date"   timestamp with time zone,
  "qr"              text                     NOT NULL,
  "created_at"      timestamp with time zone NOT NULL,
  "updated_at"      timestamp with time zone NOT NULL,
  CONSTRAINT "PK_it_assets" PRIMARY KEY (id)
);

ALTER TABLE "public"."it_assets"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."it_assets"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."it_email_accounts" (
  "id"              uuid                     NOT NULL,
  "full_name"       text                     NOT NULL,
  "local_gmail"     text                     NOT NULL,
  "password"        text                     NOT NULL,
  "stlaf_email"     text                     NOT NULL,
  "old_user"        text,
  "status"          text                     NOT NULL,
  "gws_account_id"  uuid                     NOT NULL,
  "remarks"         text,
  "deleted"         boolean                  NOT NULL,
  "delete_at"       timestamp with time zone,
  "updated_by"      text,
  "old_stlaf_email" text,
  "recycled"        boolean                  NOT NULL,
  "recycled_at"     timestamp with time zone,
  "created_at"      timestamp with time zone NOT NULL,
  "updated_at"      timestamp with time zone NOT NULL,
  CONSTRAINT "PK_it_email_accounts" PRIMARY KEY (id)
);

ALTER TABLE "public"."it_email_accounts"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."it_email_accounts"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."it_tickets" (
  "id"                       uuid                     NOT NULL,
  "ticket_number"            text                     NOT NULL,
  "name"                     text                     NOT NULL,
  "company_email"            text                     NOT NULL,
  "viber_number"             text,
  "description"              text                     NOT NULL,
  "category"                 text                     NOT NULL,
  "priority"                 text                     NOT NULL,
  "status"                   text                     NOT NULL,
  "department"               text                     NOT NULL,
  "assigned_to"              uuid,
  "date_submitted"           timestamp with time zone NOT NULL,
  "updated_date"             timestamp with time zone NOT NULL,
  "created_at"               timestamp with time zone NOT NULL,
  "updated_at"               timestamp with time zone NOT NULL,
  "submitted_by_employee_id" uuid,
  "remarks"                  text,
  CONSTRAINT "PK_it_tickets" PRIMARY KEY (id)
);

ALTER TABLE "public"."it_tickets"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."it_tickets"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."module_access_positions" (
  "id"              uuid                     NOT NULL,
  "module"          text                     NOT NULL,
  "office_position" text                     NOT NULL,
  "created_at"      timestamp with time zone NOT NULL,
  "updated_at"      timestamp with time zone NOT NULL,
  CONSTRAINT "PK_module_access_positions" PRIMARY KEY (id)
);

ALTER TABLE "public"."module_access_positions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."module_access_positions"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."permissions" (
  "id"         uuid                     NOT NULL,
  "name"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_permissions" PRIMARY KEY (id)
);

ALTER TABLE "public"."permissions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."permissions"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."role_permissions" (
  "role_id"       uuid NOT NULL,
  "permission_id" uuid NOT NULL,
  CONSTRAINT "PK_role_permissions" PRIMARY KEY (role_id, permission_id)
);

ALTER TABLE "public"."role_permissions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."role_permissions"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."roles" (
  "id"         uuid                     NOT NULL,
  "name"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_roles" PRIMARY KEY (id)
);

ALTER TABLE "public"."roles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."roles"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."smtp_senders" (
  "id"           uuid                     NOT NULL,
  "label"        text                     NOT NULL,
  "email"        text                     NOT NULL,
  "app_password" text                     NOT NULL,
  "created_at"   timestamp with time zone NOT NULL,
  "updated_at"   timestamp with time zone NOT NULL,
  CONSTRAINT "PK_smtp_senders" PRIMARY KEY (id)
);

ALTER TABLE "public"."smtp_senders"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."smtp_senders"
  FORCE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"                    uuid                     NOT NULL,
  "email"                 text,
  "password_hash"         text                     NOT NULL,
  "full_name"             text                     NOT NULL,
  "department_id"         uuid                     NOT NULL,
  "role_id"               uuid                     NOT NULL,
  "is_active"             boolean                  NOT NULL,
  "created_at"            timestamp with time zone NOT NULL,
  "updated_at"            timestamp with time zone NOT NULL,
  "username"              text,
  "failed_login_attempts" integer                  NOT NULL DEFAULT 0,
  "lockout_end"           timestamp with time zone,
  CONSTRAINT "PK_users" PRIMARY KEY (id)
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users"
  FORCE ROW LEVEL SECURITY;

ALTER TABLE "public"."client_portal_form_schemas"
  ADD CONSTRAINT "FK_client_portal_form_schemas_client_portal_document_templates~" FOREIGN KEY (document_template_id) REFERENCES public.client_portal_document_templates(id)
    ON DELETE CASCADE;

ALTER TABLE "public"."client_portal_document_templates"
  ADD CONSTRAINT "FK_client_portal_document_templates_client_portal_services_ser~" FOREIGN KEY (service_id) REFERENCES public.client_portal_services(id) ON DELETE CASCADE;

ALTER TABLE "public"."client_portal_submissions"
  ADD CONSTRAINT "FK_client_portal_submissions_client_accounts_client_account_id" FOREIGN KEY (client_account_id) REFERENCES public.client_accounts(id) ON DELETE CASCADE;

ALTER TABLE "public"."client_portal_submissions"
  ADD CONSTRAINT "FK_client_portal_submissions_client_portal_services_service_id" FOREIGN KEY (service_id) REFERENCES public.client_portal_services(id) ON DELETE RESTRICT;

ALTER TABLE "public"."client_portal_generated_documents"
  ADD CONSTRAINT "FK_client_portal_generated_documents_client_portal_submissions~" FOREIGN KEY (submission_id) REFERENCES public.client_portal_submissions(id) ON DELETE CASCADE;

ALTER TABLE "public"."client_portal_subscriptions"
  ADD CONSTRAINT "FK_client_portal_subscriptions_client_accounts_client_account_~" FOREIGN KEY (client_account_id) REFERENCES public.client_accounts(id) ON DELETE CASCADE;

ALTER TABLE "public"."client_portal_subscriptions"
  ADD CONSTRAINT "FK_client_portal_subscriptions_client_portal_voucher_codes_vou~" FOREIGN KEY (voucher_code_id) REFERENCES public.client_portal_voucher_codes(id) ON DELETE
    SET NULL;

ALTER TABLE "public"."hr_employees"
  ADD CONSTRAINT "FK_hr_employees_hr_employee_categories_category_id" FOREIGN KEY (category_id) REFERENCES public.hr_employee_categories(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_employee_leave_credits"
  ADD CONSTRAINT "FK_hr_employee_leave_credits_hr_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES public.hr_employees(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_leave_approvers"
  ADD CONSTRAINT "FK_hr_leave_approvers_hr_employees_approver_employee_id" FOREIGN KEY (approver_employee_id) REFERENCES public.hr_employees(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_leave_requests"
  ADD CONSTRAINT "FK_hr_leave_requests_hr_employees_decided_by_employee_id" FOREIGN KEY (decided_by_employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_leave_requests"
  ADD CONSTRAINT "FK_hr_leave_requests_hr_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES public.hr_employees(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_leave_requests"
  ADD CONSTRAINT "FK_hr_leave_requests_hr_employees_retraction_decided_by_employ~" FOREIGN KEY (retraction_decided_by_employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_employee_leave_credits"
  ADD CONSTRAINT "FK_hr_employee_leave_credits_hr_leave_types_leave_type_id" FOREIGN KEY (leave_type_id) REFERENCES public.hr_leave_types(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_leave_requests"
  ADD CONSTRAINT "FK_hr_leave_requests_hr_leave_types_leave_type_id" FOREIGN KEY (leave_type_id) REFERENCES public.hr_leave_types(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_medical_certificates"
  ADD CONSTRAINT "FK_hr_medical_certificates_hr_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_medical_certificates"
  ADD CONSTRAINT "FK_hr_medical_certificates_hr_employees_verified_by_employee_id" FOREIGN KEY (verified_by_employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_medical_certificates"
  ADD CONSTRAINT "FK_hr_medical_certificates_hr_leave_requests_leave_request_id" FOREIGN KEY (leave_request_id) REFERENCES public.hr_leave_requests(id);

ALTER TABLE "public"."hr_overtime_partners"
  ADD CONSTRAINT "FK_hr_overtime_partners_hr_employees_partner_employee_id" FOREIGN KEY (partner_employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_overtime_requests"
  ADD CONSTRAINT "FK_hr_overtime_requests_hr_employees_dept_decided_by_employee_~" FOREIGN KEY (dept_decided_by_employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_overtime_requests"
  ADD CONSTRAINT "FK_hr_overtime_requests_hr_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_overtime_requests"
  ADD CONSTRAINT "FK_hr_overtime_requests_hr_employees_partner_decided_by_employ~" FOREIGN KEY (partner_decided_by_employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_undertime_requests"
  ADD CONSTRAINT "FK_hr_undertime_requests_hr_employees_decided_by_employee_id" FOREIGN KEY (decided_by_employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."hr_undertime_requests"
  ADD CONSTRAINT "FK_hr_undertime_requests_hr_employees_employee_id" FOREIGN KEY (employee_id) REFERENCES public.hr_employees(id);

ALTER TABLE "public"."intake_services"
  ADD CONSTRAINT "FK_intake_services_intake_groups_group_id" FOREIGN KEY (group_id) REFERENCES public.intake_groups(id) ON DELETE CASCADE;

ALTER TABLE "public"."intake_submission_services"
  ADD CONSTRAINT "FK_intake_submission_services_intake_services_service_id" FOREIGN KEY (service_id) REFERENCES public.intake_services(id) ON DELETE RESTRICT;

ALTER TABLE "public"."intake_submission_services"
  ADD CONSTRAINT "FK_intake_submission_services_intake_submissions_submission_id" FOREIGN KEY (submission_id) REFERENCES public.intake_submissions(id) ON DELETE CASCADE;

ALTER TABLE "public"."it_app_passwords"
  ADD CONSTRAINT "FK_it_app_passwords_gws_accounts_gws_account_id" FOREIGN KEY (gws_account_id) REFERENCES public.gws_accounts(id) ON DELETE CASCADE;

ALTER TABLE "public"."it_asset_history"
  ADD CONSTRAINT "FK_it_asset_history_it_assets_asset_id" FOREIGN KEY (asset_id) REFERENCES public.it_assets(id) ON DELETE CASCADE;

ALTER TABLE "public"."it_email_accounts"
  ADD CONSTRAINT "FK_it_email_accounts_gws_accounts_gws_account_id" FOREIGN KEY (gws_account_id) REFERENCES public.gws_accounts(id) ON DELETE CASCADE;

ALTER TABLE "public"."role_permissions"
  ADD CONSTRAINT "FK_role_permissions_permissions_permission_id" FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;

ALTER TABLE "public"."role_permissions"
  ADD CONSTRAINT "FK_role_permissions_roles_role_id" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_leave_notification_settings"
  ADD CONSTRAINT "FK_hr_leave_notification_settings_smtp_senders_smtp_sender_id" FOREIGN KEY (smtp_sender_id) REFERENCES public.smtp_senders(id) ON DELETE CASCADE;

ALTER TABLE "public"."users"
  ADD CONSTRAINT "FK_users_departments_department_id" FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;

ALTER TABLE "public"."users"
  ADD CONSTRAINT "FK_users_roles_role_id" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

ALTER TABLE "public"."hr_employees"
  ADD CONSTRAINT "FK_hr_employees_users_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id);

CREATE UNIQUE INDEX "IX_client_accounts_email" ON public.client_accounts USING btree (email);

CREATE UNIQUE INDEX "IX_client_portal_admin_grants_user_id" ON public.client_portal_admin_grants USING btree (user_id);

CREATE INDEX "IX_client_portal_document_templates_service_id" ON public.client_portal_document_templates USING btree (service_id);

CREATE UNIQUE INDEX "IX_client_portal_form_schemas_document_template_id_version" ON public.client_portal_form_schemas USING btree (document_template_id, VERSION);

CREATE INDEX "IX_client_portal_generated_documents_submission_id" ON public.client_portal_generated_documents USING btree (submission_id);

CREATE INDEX "IX_client_portal_submissions_client_account_id" ON public.client_portal_submissions USING btree (client_account_id);

CREATE INDEX "IX_client_portal_submissions_service_id" ON public.client_portal_submissions USING btree (service_id);

CREATE UNIQUE INDEX "IX_client_portal_subscriptions_client_account_id" ON public.client_portal_subscriptions USING btree (client_account_id);

CREATE INDEX "IX_client_portal_subscriptions_voucher_code_id" ON public.client_portal_subscriptions USING btree (voucher_code_id);

CREATE UNIQUE INDEX "IX_client_portal_voucher_codes_code" ON public.client_portal_voucher_codes USING btree (code);

CREATE UNIQUE INDEX "IX_departments_name" ON public.departments USING btree (name);

CREATE UNIQUE INDEX "IX_document_requests_tracking_number" ON public.document_requests USING btree (tracking_number);

CREATE UNIQUE INDEX "IX_hr_employee_categories_code" ON public.hr_employee_categories USING btree (code);

CREATE UNIQUE INDEX "IX_hr_employee_leave_credits_employee_id_leave_type_id" ON public.hr_employee_leave_credits USING btree (employee_id, leave_type_id);

CREATE INDEX "IX_hr_employee_leave_credits_leave_type_id" ON public.hr_employee_leave_credits USING btree (leave_type_id);

CREATE INDEX "IX_hr_employees_category_id" ON public.hr_employees USING btree (category_id);

CREATE UNIQUE INDEX "IX_hr_employees_company_id" ON public.hr_employees USING btree (company_id);

CREATE INDEX "IX_hr_employees_user_id" ON public.hr_employees USING btree (user_id);

CREATE INDEX "IX_hr_leave_approvers_approver_employee_id" ON public.hr_leave_approvers USING btree (approver_employee_id);

CREATE UNIQUE INDEX "IX_hr_leave_approvers_department" ON public.hr_leave_approvers USING btree (department);

CREATE INDEX "IX_hr_leave_notification_settings_smtp_sender_id" ON public.hr_leave_notification_settings USING btree (smtp_sender_id);

CREATE INDEX "IX_hr_leave_requests_decided_by_employee_id" ON public.hr_leave_requests USING btree (decided_by_employee_id);

CREATE INDEX "IX_hr_leave_requests_employee_id" ON public.hr_leave_requests USING btree (employee_id);

CREATE INDEX "IX_hr_leave_requests_leave_type_id" ON public.hr_leave_requests USING btree (leave_type_id);

CREATE INDEX "IX_hr_leave_requests_retraction_decided_by_employee_id" ON public.hr_leave_requests USING btree (retraction_decided_by_employee_id);

CREATE INDEX "IX_hr_medical_certificates_employee_id" ON public.hr_medical_certificates USING btree (employee_id);

CREATE INDEX "IX_hr_medical_certificates_leave_request_id" ON public.hr_medical_certificates USING btree (leave_request_id);

CREATE INDEX "IX_hr_medical_certificates_verified_by_employee_id" ON public.hr_medical_certificates USING btree (verified_by_employee_id);

CREATE UNIQUE INDEX "IX_hr_overtime_partners_department" ON public.hr_overtime_partners USING btree (department);

CREATE INDEX "IX_hr_overtime_partners_partner_employee_id" ON public.hr_overtime_partners USING btree (partner_employee_id);

CREATE INDEX "IX_hr_overtime_requests_dept_decided_by_employee_id" ON public.hr_overtime_requests USING btree (dept_decided_by_employee_id);

CREATE INDEX "IX_hr_overtime_requests_employee_id" ON public.hr_overtime_requests USING btree (employee_id);

CREATE INDEX "IX_hr_overtime_requests_partner_decided_by_employee_id" ON public.hr_overtime_requests USING btree (partner_decided_by_employee_id);

CREATE INDEX "IX_hr_undertime_requests_decided_by_employee_id" ON public.hr_undertime_requests USING btree (decided_by_employee_id);

CREATE INDEX "IX_hr_undertime_requests_employee_id" ON public.hr_undertime_requests USING btree (employee_id);

CREATE UNIQUE INDEX "IX_intake_full_access_grants_company_id" ON public.intake_full_access_grants USING btree (company_id);

CREATE INDEX "IX_intake_services_group_id" ON public.intake_services USING btree (group_id);

CREATE INDEX "IX_intake_submission_services_service_id" ON public.intake_submission_services USING btree (service_id);

CREATE INDEX "IX_intake_submission_services_submission_id" ON public.intake_submission_services USING btree (submission_id);

CREATE UNIQUE INDEX "IX_intake_submissions_tracking_number" ON public.intake_submissions USING btree (tracking_number);

CREATE INDEX "IX_it_app_passwords_gws_account_id" ON public.it_app_passwords USING btree (gws_account_id);

CREATE INDEX "IX_it_asset_history_asset_id" ON public.it_asset_history USING btree (asset_id);

CREATE UNIQUE INDEX "IX_it_assets_asset_tag" ON public.it_assets USING btree (asset_tag);

CREATE INDEX "IX_it_email_accounts_gws_account_id" ON public.it_email_accounts USING btree (gws_account_id);

CREATE UNIQUE INDEX "IX_it_tickets_ticket_number" ON public.it_tickets USING btree (ticket_number);

CREATE UNIQUE INDEX "IX_module_access_positions_module_office_position" ON public.module_access_positions USING btree (module, office_position);

CREATE UNIQUE INDEX "IX_permissions_name" ON public.permissions USING btree (name);

CREATE INDEX "IX_role_permissions_permission_id" ON public.role_permissions USING btree (permission_id);

CREATE UNIQUE INDEX "IX_roles_name" ON public.roles USING btree (name);

CREATE INDEX "IX_users_department_id" ON public.users USING btree (department_id);

CREATE UNIQUE INDEX "IX_users_email" ON public.users USING btree (email);

CREATE INDEX "IX_users_role_id" ON public.users USING btree (role_id);

CREATE UNIQUE INDEX "IX_users_username" ON public.users USING btree (username);

REVOKE ALL ON SCHEMA "public" FROM PUBLIC;

GRANT CREATE, USAGE ON SCHEMA "public" TO PUBLIC;

REVOKE ALL ON SCHEMA "public" FROM "postgres";

GRANT CREATE, USAGE ON SCHEMA "public" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."__EFMigrationsHistory" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."announcements" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_accounts" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_admin_grants" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_document_templates" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_form_schemas" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_generated_documents" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_services" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_submissions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_subscriptions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."client_portal_voucher_codes" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."departments" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."document_requests" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."gws_accounts" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_employee_categories" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_employee_leave_credits" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_employees" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_leave_approvers" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_leave_notification_settings" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_leave_requests" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_leave_types" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_medical_certificates" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_overtime_partners" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_overtime_requests" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."hr_undertime_requests" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."intake_full_access_grants" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."intake_groups" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."intake_services" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."intake_submission_services" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."intake_submissions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."it_app_passwords" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."it_asset_history" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."it_assets" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."it_email_accounts" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."it_tickets" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."module_access_positions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."permissions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."role_permissions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."roles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."smtp_senders" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "postgres";

