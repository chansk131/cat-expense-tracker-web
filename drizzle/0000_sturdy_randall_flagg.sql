CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item` text NOT NULL,
	`category` text,
	`amount` real NOT NULL,
	`created_at` integer NOT NULL
);
