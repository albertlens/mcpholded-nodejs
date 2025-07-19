declare const _exports: HoldedService;
export = _exports;
declare class HoldedService {
    axiosInstance: any;
    getContacts(): Promise<any>;
    getContactById(contactId: any): Promise<any>;
    createContact(contactData: any): Promise<any>;
    getServices(): Promise<any>;
    getServiceById(serviceId: any): Promise<any>;
    createAppointment(appointmentData: any): Promise<any>;
    getAppointments(): Promise<any>;
    getAppointmentById(appointmentId: any): Promise<any>;
    updateAppointment(appointmentId: any, updateData: any): Promise<any>;
    deleteAppointment(appointmentId: any): Promise<any>;
}
