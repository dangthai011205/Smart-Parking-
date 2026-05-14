Register:

{
  "username": "student",
  "password": "1234",
  "name": "Student User",
  "email": "student@hcmut.edu.vn"
}

login:
{
  "username": "student",
  "password": "1234"
}

Update_profile:

{
  "name": "Student X",
  "email": "studentx@hcmut.edu.vn"
}

Enter_Parking:

{
  "vehicleNumber": "51A-123.45"
}

Pay_Ticket:

{
  "ticketId": 1,
  "amount": 5000
}
Exit:
{
  "ticketId": 1
}

Operator:
GET /operator/slots → trạng thái slot
POST /operator/update
GET /operator/logs → xem toàn bộ ticket/history
{
  "slotId": 1,
  "occupied": true,
  "vehicleNumber": "51A-123.45"
}

Admin
GET /admin/users → xem danh sách user
POST /admin/role
{
  "userId": 1,
  "role": "operator"
}