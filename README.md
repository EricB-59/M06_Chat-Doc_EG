##Objectius didàctics

- Comprendre la diferència entre AJAX i WebSockets
- Dissenyar i consumir APIs REST
- Implementar funcionalitats en temps real
- Sincronitzar accions i continguts entre diversos usuaris
- Consolidar coneixements de frontend i backend amb una aplicació funcional
- Practicar el treball cooperatiu en parella, amb rols clars

#BLOCS/ISSUES + ENDPOINTS

##Sistema de xat en temps real#

[ ] Configurar WEBSOCKET al backend i al frontend
[ ] Veriricar usuari
ENDPOIN: LOGIN

[ ] Permetre enviar i rebre missatges
ENDPOINT: SEND_MESAGGE

[ ] Guardar l’historial de missatges a un arxiu json
ENDPOINT: SAVE_HIST

[ ] Endpoint per visualitzar, recuperar i exportar l’historial en .txt o .json
ENDPOINT: VIEW_HIST

##Enviament i gestió d’arxius#

[ ] Afegir suport per a pujada de fitxers amb multer o express-fileupload
[ ] Limitar mida i tipus de fitxers acceptats
[ ] Desar els arxius al servidor
ENDPOINT: ENVIAR_DOC

[ ] Mostrar llista de fitxers disponibles dins la sala
ENDPOINT: LIST_DOC

[ ] Permetre descàrrega
ENDPOINT:DOWN_DOC

##Document col·laboratiu#

[ ] Afegir component d’edició col·laborativa (textarea)
[ ] Permetre crear/obrir document
[ ] Sincronitzar els canvis
ENDPOINT: SINCRO_DOC

[ ] Enviar estat inicial a nous usuaris que entren a la sala
[ ] Desar periòdicament el contingut del document (autosave)
ENDPOINT: SAVE_DOC

[ ] Exportar el document com .txt o .pdf
ENDPOINT_EXPORT_DOC

##Frontend i UX#

[ ] Dissenyar la vista de xat amb espai per missatges, arxius i document
[ ] Afegir notificacions de nous missatges
[ ] Dissenyar una vista clara per mostrar el document compartit
[ ] Fer que la UI sigui responsive i usable

##Altres funcionalitats útils#

[ ] Afegir identificació visual de qui ha escrit cada missatge
[ ] Mostrar nom de qui està editant el document
[ ] Afegir botó de “Crear document col·laboratiu” dins la sala
[ ] Controlar errors i desconnexions al servidor

##Extensió 1#

[ ] Historial de versions del document col·laboratiu
[ ] Sistema de comentaris dins del document
[ ] Convidar a un usuari en concret a revisar el document
