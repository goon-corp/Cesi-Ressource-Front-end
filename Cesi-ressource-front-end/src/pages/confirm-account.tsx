import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "@/services/user.service";
import { toast } from "@/components/ui/Toast";

const ConfirmAccountPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            navigate("/error?msg=Lien de confirmation invalide.");
            return;
        }

        userService.confirmAccount(token)
            .then(() => {
                navigate("/login");
            })
            .catch(() => {
                navigate("/error?msg=Erreur lors de la confirmation du compte");
            });
    }, []);
    return (
        <div>Loading</div>
    )
};

export default ConfirmAccountPage;