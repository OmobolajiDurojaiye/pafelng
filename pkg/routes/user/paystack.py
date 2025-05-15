from flask import Blueprint, request, redirect, url_for, flash, session, current_app
from pkg.models import VehicleVerification, db, User
from werkzeug.utils import secure_filename
import os, requests, random, uuid

paystack_bp = Blueprint("paystack", __name__, url_prefix="/paystack")


def verify_paystack_transaction(reference):
    url = f"https://api.paystack.co/transaction/verify/{reference}"
    headers = {
        "Authorization": "Bearer sk_live_63a2c71ce5ac9e4d44205d79e763912ba8eb56de"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json().get("data", {})
        return {
            "verified": data.get("status") == "success",
            "amount": data.get("amount", 0),
            "reference": data.get("reference"),
        }
    return {"verified": False}


def save_uploaded_document(file, user_name):
    if not file:
        return None, None
    filename = secure_filename(file.filename)
    ext = filename.split('.')[-1]
    new_name = f"{secure_filename(user_name)}_{uuid.uuid4().hex[:8]}.{ext}"
    folder = os.path.join(current_app.root_path, 'static', 'uploads', 'vehicle_docs')
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, new_name)
    file.save(file_path)
    return f"uploads/vehicle_docs/{new_name}", filename


@paystack_bp.route("/verify_payment", methods=["POST"])
def verify_payment():
    if "user_id" not in session:
        flash("Please log in to continue", "error")
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])
    if not user:
        flash("User not found", "error")
        return redirect(url_for("auth.login"))

    # Get form fields
    ref = request.form.get("paystack_ref")
    name = request.form.get("name")
    email = request.form.get("email")
    phone = request.form.get("phone")
    c_number = request.form.get("cNumber")
    doc_file = request.files.get("document")

    # Verify Paystack transaction
    result = verify_paystack_transaction(ref)
    if not result["verified"]:
        flash("Payment failed or not verified", "danger")
        return redirect(url_for("car_custom_doc.vehicle_verification"))

    # Save document
    doc_path, original_filename = save_uploaded_document(doc_file, user.name)

    # Save verification record
    verification = VehicleVerification(
        user_id=user.id,
        name=name,
        email=email,
        phone=phone,
        c_number=c_number,
        document_path=doc_path,
        original_filename=original_filename,
        payment_method="paystack",
        paystack_ref=ref,
        amount_paid=result["amount"],
        payment_verified=True
    )
    db.session.add(verification)
    db.session.commit()

    flash("Vehicle verification request submitted successfully!", "success")
    return redirect(url_for("car_custom_doc.my_verifications"))
