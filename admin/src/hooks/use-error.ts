import { toast } from '@/hooks/use-toast';

export function useError() {
    function error(err, title) {
        console.error("An Error occurred", err);

        const errorMessage = err.response?.data?.message || "An unexpected error occurred";
        toast({
            variant: "destructive",
            title,
            description: errorMessage,
        });
        throw err;
    }
    return {error}
}

