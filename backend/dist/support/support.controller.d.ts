import { SupportService } from './support.service';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    getCategories(): Promise<{
        id: string;
        name: string;
        icon: string | null;
        defaultPriority: import(".prisma/client").$Enums.TicketPriority;
        department: import(".prisma/client").$Enums.TicketDepartment;
    }[]>;
    getMyTickets(req: any): Promise<({
        category: {
            id: string;
            name: string;
            icon: string | null;
            defaultPriority: import(".prisma/client").$Enums.TicketPriority;
            department: import(".prisma/client").$Enums.TicketDepartment;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        assignedToId: string | null;
        description: string | null;
        subject: string;
        priority: import(".prisma/client").$Enums.TicketPriority;
        department: import(".prisma/client").$Enums.TicketDepartment;
        ticketNumber: string;
        responseDue: Date | null;
        resolutionDue: Date | null;
        slaBreached: boolean;
        relatedOrderId: string | null;
        relatedCardId: string | null;
        relatedRemittanceId: string | null;
        categoryId: string;
    })[]>;
    getTicketDetails(id: string, req: any): Promise<{
        messages: ({
            sender: {
                roleRef: {
                    name: string;
                } | null;
                fullName: string | null;
            } | null;
        } & {
            id: string;
            message: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.TicketMessageType;
            senderId: string | null;
            ticketId: string;
        })[];
        activities: {
            id: string;
            createdAt: Date;
            action: string;
            actorId: string | null;
            ticketId: string;
        }[];
        category: {
            id: string;
            name: string;
            icon: string | null;
            defaultPriority: import(".prisma/client").$Enums.TicketPriority;
            department: import(".prisma/client").$Enums.TicketDepartment;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        assignedToId: string | null;
        description: string | null;
        subject: string;
        priority: import(".prisma/client").$Enums.TicketPriority;
        department: import(".prisma/client").$Enums.TicketDepartment;
        ticketNumber: string;
        responseDue: Date | null;
        resolutionDue: Date | null;
        slaBreached: boolean;
        relatedOrderId: string | null;
        relatedCardId: string | null;
        relatedRemittanceId: string | null;
        categoryId: string;
    }>;
    createTicket(req: any, data: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        assignedToId: string | null;
        description: string | null;
        subject: string;
        priority: import(".prisma/client").$Enums.TicketPriority;
        department: import(".prisma/client").$Enums.TicketDepartment;
        ticketNumber: string;
        responseDue: Date | null;
        resolutionDue: Date | null;
        slaBreached: boolean;
        relatedOrderId: string | null;
        relatedCardId: string | null;
        relatedRemittanceId: string | null;
        categoryId: string;
    }>;
    addMessage(id: string, req: any, data: {
        message: string;
        type?: string;
    }): Promise<{
        sender: {
            roleRef: {
                name: string;
            } | null;
            fullName: string | null;
        } | null;
    } & {
        id: string;
        message: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TicketMessageType;
        senderId: string | null;
        ticketId: string;
    }>;
    updateStatus(id: string, req: any, data: {
        status: string;
    }): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        assignedToId: string | null;
        description: string | null;
        subject: string;
        priority: import(".prisma/client").$Enums.TicketPriority;
        department: import(".prisma/client").$Enums.TicketDepartment;
        ticketNumber: string;
        responseDue: Date | null;
        resolutionDue: Date | null;
        slaBreached: boolean;
        relatedOrderId: string | null;
        relatedCardId: string | null;
        relatedRemittanceId: string | null;
        categoryId: string;
    }>;
}
