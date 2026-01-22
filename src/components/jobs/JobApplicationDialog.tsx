import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface JobApplicationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    onSubmit: (data: JobApplicationFormData) => Promise<void>;
}

export interface JobApplicationFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    coverLetter: string;
    resume: File | null;
}

export function JobApplicationDialog({
    isOpen,
    onClose,
    jobTitle,
    onSubmit
}: JobApplicationDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<JobApplicationFormData>();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                setSelectedFile(file);
            } else {
                alert(t('err_upload_file'));
                e.target.value = ''; // Reset input
            }
        }
    };

    const onFormSubmit = async (data: JobApplicationFormData) => {
        try {
            setIsSubmitting(true);
            await onSubmit({ ...data, resume: selectedFile });
            reset();
            setSelectedFile(null);
            onClose();
        } catch (error) {
            console.error('Application failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('job_form_title')} {jobTitle}</DialogTitle>
                    <DialogDescription>
                        {t('job_form_desc')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('name_label')} *</Label>
                            <Input
                                id="name"
                                {...register('name', { required: t('err_name_required') })}
                                placeholder="John Doe"
                            />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email_label')} *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: t('err_email_required'),
                                    pattern: { value: /^\S+@\S+$/i, message: t('err_email_invalid') }
                                })}
                                placeholder="john@example.com"
                            />
                            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phone_label')} *</Label>
                            <Input
                                id="phone"
                                {...register('phone', { required: t('err_phone_required') })}
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                {...register('address', { required: t('err_address_required') })}
                                placeholder="City, Country"
                            />
                            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resume">{t('job_form_resume')}</Label>
                        <div className="border-2 border-dashed border-border p-6 rounded-lg text-center hover:bg-secondary/50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                id="resume"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                                required={!selectedFile}
                            />
                            <div className="flex flex-col items-center gap-2">
                                {selectedFile ? (
                                    <>
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                        <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                                        <span className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">{t('job_form_upload_text')}</span>
                                        <span className="text-xs text-muted-foreground leading-tight">{t('job_form_upload_sub')}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coverLetter">{t('job_form_cover')}</Label>
                        <Textarea
                            id="coverLetter"
                            {...register('coverLetter')}
                            placeholder={t('job_form_placeholder_cover')}
                            className="min-h-[120px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            {t('btn_cancel')}
                        </Button>
                        <Button type="submit" className="btn-gold" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('btn_submitting')}
                                </>
                            ) : (
                                t('btn_submit_app')
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
