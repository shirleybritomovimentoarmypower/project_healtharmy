CREATE TABLE `volunteerAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`volunteerId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `volunteerAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `volunteers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`specialization` varchar(255) NOT NULL,
	`professionalRegistration` varchar(100) NOT NULL,
	`project` enum('borahae_terapias','purple_army') NOT NULL,
	`serviceType` enum('gratuito','valor_social','ambos') NOT NULL,
	`modality` enum('online','presencial') NOT NULL,
	`sessionDuration` int NOT NULL DEFAULT 50,
	`frequency` enum('semanal','quinzenal','pontual') NOT NULL,
	`notes` text,
	`address` text,
	`status` enum('ativo','inativo','pendente') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `volunteers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `volunteerAvailability` ADD CONSTRAINT `volunteerAvailability_volunteerId_volunteers_id_fk` FOREIGN KEY (`volunteerId`) REFERENCES `volunteers`(`id`) ON DELETE cascade ON UPDATE no action;