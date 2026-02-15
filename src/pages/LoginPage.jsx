import { useDispatch, useSelector } from "react-redux";
import { connecter } from "../features/auth/authSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {erreur, user, autentifier} = useSelector(state=>state.auth)
    useEffect(() => {
        if (autentifier && user) {
            if (user.role === 'employee') {
                navigate('/dashboard/personnel');
            } else if (user.role === 'client') {
                navigate('/dashboard/client');
            }else if(user.role=== "admin"){
                  navigate('/dashboard/chef')
            } else {
                navigate('/');
            }
        }
    }, [autentifier, user, navigate]);
    const users = useSelector(state=>state.users.users)
    const handleSubmit = (e)=>{
        e.preventDefault();
        const user = users.find(u=> u.email ===e.target.email.value && u.password=== e.target.pass.value)
        if(user){
          dispatch(connecter(user))
        }else{
          dispatch(connecter({err:1}))
        }
        
    }
  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-4">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Se Connecter</h2>
            {erreur && <div className="alert alert-danger p-2 small">{erreur}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Example@carflex.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">mot de passe:</label>
                <input
                  type="password"
                  className="form-control"
                  name="pass"
                  placeholder="1234"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Connecter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
