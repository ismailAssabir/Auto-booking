export default function FormUser({data,handleSubmit, btnText}){

    return <div className="row justify-content-center mt-5">
      <div className="col-md-4">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">{btnText==="Modifier"? "Modifier l'utilisateur":"S'inscrire"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nom:</label>
                <input type="text" defaultValue={data.name} name="nom" className="form-control" placeholder="Enter votre nom"required/>
              </div>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input defaultValue={data.email} type="email" className="form-control" name="email" placeholder="Example@gmail.com" required/>
              </div>
              <div className="mb-3">
                <label className="form-label">mot de passe:</label>
                <input type="password" defaultValue={data.password} className="form-control" name="pass" placeholder="1234" required/>
              </div>
              <div className="mb-3">
                <label className="form-label">Votre image:</label>
                <input type="file" className="form-control" name="image"  required={btnText ==="Inscrire"}/>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                {btnText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
}