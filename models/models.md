# Models

## Overview

La capa `models` define los documentos MongoDB usados por Megaphone Messenger. Todos los
modelos se construyen con `OwlModel` de `owl-expressjs-utils` y usan referencias `ObjectId`
para mantener separadas las entidades principales, los recursos relacionados y los estados.

La documentación de este archivo es un índice general. Cada modelo tiene una página propia con
sus campos, validaciones, endpoints, ejemplos y limitaciones.

## Model navigation

| Model | Purpose | Documentation |
| --- | --- | --- |
| `User` | Cuenta autenticada, credenciales e identidad del propietario. | [User model](user/user.md) |
| `Contact` | Contacto perteneciente a un usuario. | [Contact model](contact/contact.md) |
| `Email` | Correo de un usuario o contacto. | [Email model](email/email.md) |
| `PhoneNumber` | Número telefónico de un usuario o contacto. | [PhoneNumber model](phone/phone.md) |
| `Address` | Dirección de un usuario o contacto, con coordenadas opcionales. | [Address model](address/address.md) |
| `State` | Estado categórico reutilizable por varios modelos. | [State model](state/state.md) |
| `Message` | Mensaje creado por un usuario y enviado mediante la integración de WhatsApp. | [Message model](message/message.md) |
| `MessageReceptor` | Relación entre un mensaje y un contacto receptor. | [MessageReceptor model](messageReceptor/messageReceptor.md) |
| `Token` | Credenciales de proveedores de mensajería pertenecientes a un usuario. | [Token model](tokens/tokens.md) |

## Complete relationship diagram

```mermaid
classDiagram
		class User {
				ObjectId _id
				String name
				String lastname
				String password
				ObjectId state
		}

		class Contact {
				ObjectId _id
				String name
				ObjectId owner
				ObjectId state
		}

		class Email {
				ObjectId _id
				String email
				ObjectId owner
				String ownerType
				ObjectId state
		}

		class PhoneNumber {
				ObjectId _id
				String phone
				String countryNumber
				ObjectId owner
				String ownerType
				ObjectId[] state
		}

		class Address {
				ObjectId _id
				String street
				String city
				String postalCode
				String country
				Number latitude
				Number longitude
				ObjectId owner
				String ownerType
				ObjectId state
		}

		class State {
				ObjectId _id
				String name
				String description
				String type
		}

		class Message {
				ObjectId _id
				String content
				String header
				ObjectId sender
				ObjectId state
		}

		class MessageReceptor {
				ObjectId _id
				ObjectId message
				ObjectId contact
		}

		class Token {
				ObjectId _id
				String emailToken
				String whatsappToken
				String telegramToken
				ObjectId owner
		}

		User "1" --> "many" Contact : owns
		User "1" --> "many" Email : owner when ownerType = User
		User "1" --> "many" PhoneNumber : owner when ownerType = User
		User "1" --> "many" Address : owner when ownerType = User
		User "1" --> "many" Token : owns
		User "1" --> "many" Message : sender

		Contact "1" --> "many" Email : owner when ownerType = Contact
		Contact "1" --> "many" PhoneNumber : owner when ownerType = Contact
		Contact "1" --> "many" Address : owner when ownerType = Contact
		Contact "1" --> "many" MessageReceptor : receives

		Message "1" --> "many" MessageReceptor : recipients

		State "0..1" --> "many" User : type = user
		State "0..1" --> "many" Contact : type = contact
		State "0..1" --> "many" Email : type = email
		State "0..1" --> "many" PhoneNumber : type = phoneNumber
		State "0..1" --> "many" Address : type = address
		State "0..1" --> "many" Message : state
```

## Ownership and reference map

```mermaid
flowchart LR
		U[User]
		C[Contact]
		E[Email]
		P[PhoneNumber]
		A[Address]
		T[Token]
		M[Message]
		R[MessageReceptor]
		S[State]

		U -->|owner| C
		U -->|owner + ownerType = User| E
		U -->|owner + ownerType = User| P
		U -->|owner + ownerType = User| A
		U -->|owner| T
		U -->|sender| M

		C -->|owner + ownerType = Contact| E
		C -->|owner + ownerType = Contact| P
		C -->|owner + ownerType = Contact| A
		C -->|contact| R
		M -->|message| R

		S -.->|optional state reference| U
		S -.->|optional state reference| C
		S -.->|optional state reference| E
		S -.->|optional state reference| P
		S -.->|optional state reference| A
		S -.->|optional state reference| M
```

## Polymorphic resources

`Email`, `PhoneNumber` y `Address` comparten el patrón de propiedad polimórfica:

```js
{
	owner: ObjectId,
	ownerType: "User" | "Contact",
}
```

El campo `owner` contiene el identificador y `ownerType` determina si debe resolverse contra
`User` o `Contact`. Estos campos siempre deben consultarse juntos; un `owner` aislado no
identifica de forma suficiente la colección de destino.

## State relationships

`State` es un modelo reutilizable. La mayoría de sus relaciones son referencias opcionales de
un solo valor; `PhoneNumber.state` es la excepción y almacena un arreglo de referencias.

El campo `State.type` acepta únicamente:

```text
address | user | contact | email | phoneNumber
```

El esquema no verifica automáticamente que un estado exista ni que su `type` sea compatible
con el documento que lo referencia.

## Messaging relationships

`Message.sender` referencia a `User`. La relación con contactos receptores está modelada por
`MessageReceptor`, que contiene `message` y `contact`, permitiendo varios receptores por
mensaje.

Actualmente `MessageReceptor` está definido pero no se registra como ruta en `config.js`. La
ruta `POST /message/send` también acepta `receiver` y lo pasa al guardado de `Message`, aunque
ese campo no está declarado en el esquema actual. La documentación detallada de [Message](message/message.md)
y [MessageReceptor](messageReceptor/messageReceptor.md) describe esta limitación.

## Model files

```mermaid
flowchart TD
		Models[models/]
		Models --> Address[address/address.js]
		Models --> Contact[contact/contact.js]
		Models --> Email[email/email.js]
		Models --> Message[message/message.js]
		Models --> Receptor[messageReceptor/messageReceptor.js]
		Models --> Phone[phone/phone.js]
		Models --> State[state/state.js]
		Models --> Tokens[tokens/tokens.js]
		Models --> User[user/user.js]
```

## Detailed documentation

- [Address](address/address.md)
- [Contact](contact/contact.md)
- [Email](email/email.md)
- [Message](message/message.md)
- [MessageReceptor](messageReceptor/messageReceptor.md)
- [PhoneNumber](phone/phone.md)
- [State](state/state.md)
- [Token](tokens/tokens.md)
- [User](user/user.md)
