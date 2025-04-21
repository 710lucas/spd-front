import { useEffect, useState } from 'react';
import style from './Home.module.css';
import { useAuth } from '../Contexts/AuthContext';
import { http } from '../config/http';

export type DocumentType = {
    name: string,
    id: number,
    date: string,
    status: string,
    downloadUrl?: string,
    previewUrl?: string,
    metadata?: Map<string, string>

}

export function Home(){

    const [documents, setDocuments] = useState<DocumentType[]>([])
    const [currentDocument, setCurrentDocument] = useState<DocumentType | null>(null)
    const [newDocument, setNewDocument] = useState<{metadata : Map<string, string>, file : File | null}>({ metadata: new Map(), file: null })
    const [newDocumentModal, setNewDocumentModal] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const AuthContext = useAuth()

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const requestToDocument = (req : any) : DocumentType => {
        return {
            name: req.name,
            id: req.id,
            date: new Date(req.date).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }),
            status: req.preservationStage?.toLowerCase() == 'preservado' ? 'Preservado' : 'Em processamento',
            metadata: (req.metadata),
        }
    }

    useEffect(() => {

        if(!AuthContext.isAuthenticated()) {
            window.location.href = '/login'
            return;
        }

        fetchDocuments()

    }, [])

    useEffect(() => {
        fetchDocuments(searchValue)
    }, [searchValue])

    const fetchDocuments = async (searchValue? : string) => {
        const response = await http.get(apiUrl+'/documents?search='+(searchValue ?? ''))
        const data = await response.data
        setDocuments(
            data.map((document: any) => {
                return requestToDocument(document)
            })
        )

    }

    const fetchDocument = async (id : string, update? : boolean) => {
        const response = await http.get(`${apiUrl}/documents/${id}`)
        const responseDownload = await http.get(`${apiUrl}/documents/download/${id}`)

        const downloadUrl = await responseDownload.data
        const data = await response.data

        const newDocument = requestToDocument(data)
        newDocument.downloadUrl = downloadUrl

        console.log(newDocument)

        if(!update || update == undefined) {
            return newDocument;
        }

        setDocuments((prevDocuments) => {
            return prevDocuments.map((document) => {
                if (document.id === newDocument.id) {
                    return newDocument
                } else {
                    return document
                }
            })
        })

        return newDocument

    }

    const handleChooseDocument = async (id: string) => {
        const document = await fetchDocument(id)
        setCurrentDocument(document)
    }


    //Melhorias : colocar logica de download no backend, para não expor o link de download
    const download = async (documentDownload: DocumentType) => {
        const response = await http.get(`${apiUrl}/documents/download/${documentDownload.id}`)
        const url = await response.data
        window.open(url, '_blank')
    }

    const handleNewDocument = async () => {
        setNewDocumentModal(true)
        setNewDocument({ metadata: new Map(), file: null })
    }

    const handleMetadataChange = (index: number, key?: string, value?: string) => {
        setNewDocument(prev => {
            const newMetadata = new Map(prev.metadata);
            
            // Remove a chave antiga se o nome do metadado mudou
            const oldKey = Array.from(newMetadata.keys())[index];


            if(key && key != oldKey) {
                newMetadata.delete(oldKey);
                newMetadata.set(key, '');
            }

            // Atualiza o valor do metadado
            if(value) {
                newMetadata.set(oldKey, value);
            }
            
            return {
                ...prev,
                metadata: newMetadata
            };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setNewDocument(prev => ({
            ...prev,
            file: e.target.files![0]
          }));
        }
      };

    
    return (
        <div className={style.homePageContainer}>
            <div className={style.header}>
                <div className={style.title}>
                    Dashboard
                </div>

                <div className={style.userInfo}>
                    <div className={style.userName}>
                        {AuthContext.user?.username}
                    </div>
                    <div className={style.logoutButton} onClick={() => {AuthContext.logout(); window.location.href = '/login'}}>
                        Logout
                    </div>
                </div>
            </div>

            <div className={style.homePage}>
                <div className={style.newDocumentContainer}>
                    <div className={style.newDocumentButton} onClick={handleNewDocument}>
                        Preservar Novo Documento
                    </div>
                    <div className={style.newDocumentButton} onClick={async () => {await fetchDocuments()}}>
                        Atualizar página
                    </div>
                </div>
                <input 
                    className={style.searchBar + ' ' + style.textInput} 
                    placeholder='Pesquise por documentos'
                    value={searchValue}
                    onChange={(e) => {setSearchValue(e.target.value)}}
                />
                <div className={style.documents}>

                    {
                        documents.map((document) => {
                            return (
                                <div 
                                    title={document.name} 
                                    className={style.document + " " +  (document.status != 'Preservado' ? style.documentOtherStatus : '')}
                                >
                                    <div className={style.documentName}>
                                        {document.name}
                                    </div>
                                    <div className={style.documentOtherInfo}>
                                        <div className={style.documentDate}>
                                            {document.date}
                                        </div>
                                        <div className={style.documentStatus}>
                                            {document.status}
                                        </div>
                                        <div className={style.documentId}>
                                            #{document.id}
                                        </div>
                                    </div>
                                    {
                                        document.status === 'Preservado' &&
                                        <div className={style.documentActions}>
                                            <div className={style.documentDownloadButton} onClick={() => {download(document)}}>
                                                Download
                                            </div>
                                            <div className={style.documentDownloadButton} onClick={async () => { await handleChooseDocument(document.id.toString())/*fetchDocument(document.id.toString())*/}}>
                                                Ver mais
                                            </div>
                                        </div>
                                    }
                                </div>
                            )
                        })

                    }

                </div>
            </div>

            {
                newDocumentModal && 
                <div className={style.openDocumentModalContainer} >
                    <div className={style.newDocumentModal}>
                        <div className={style.openDocumentModalHeader}>
                            <div className={style.documentName}>
                                Novo Documento
                            </div>
                            <div className={style.closeModal} onClick={() => {setNewDocumentModal(false)}}>✖</div>
                        </div>
                        <div className={style.newDocumentModalContent}>
                            <input type="file" name="file" id="file" onChange={handleFileChange}/>

                            {[1,2,3,4].map((index) => (
                                <div className={style.metadataContainer}>
                                    <input type="text" className={style.textInput} name={`metadata${index}`} id={`metadata${index}`} placeholder={`${index}° Metadado`} onChange={(e) => handleMetadataChange(index - 1, e.target.value)} />
                                    <input type="text" className={style.textInput} name={`metadataValue${index}`} id={`metadataValue${index}`} placeholder={`Valor o ${index}° Metadado`} onChange={(e) => handleMetadataChange(index - 1, undefined, e.target.value)} />
                                </div>
                            ))}
                            {/* metadados vao gerar map de string para string */}
                            
                            <div className={style.documentDownloadButton} style={{alignSelf: 'center'}} onClick={async () => {

                                if(!newDocument.file) {
                                    alert('Selecione um arquivo')
                                    return
                                }

                                const formData = new FormData()
                                formData.append('file', newDocument.file)
                                console.log('newDocument', newDocument.file.name)
                                formData.append('metadata', JSON.stringify(Object.fromEntries(newDocument.metadata)))

                                await http.post(`${apiUrl}/documents/upload`, formData)
                                setNewDocumentModal(false)
                                fetchDocuments()
                            }}>Preservar</div>
                        </div>
                    </div>
                </div>

            }

            {
                currentDocument != undefined && 
                <div className={style.openDocumentModalContainer} >
                    <div className={style.openDocumentModal}>
                        <div className={style.openDocumentModalHeader}>
                            <div className={style.documentName}>
                                {currentDocument?.name}
                            </div>
                            <div className={style.closeModal} onClick={() => {setCurrentDocument(null)}}>✖</div>
                        </div>
                        <div className={style.openDocumentModalContent}>
                            <div className={style.documentId}>
                                ID: #{currentDocument?.id}
                            </div>
                            <div className={style.documentDate}>
                                Data: {currentDocument?.date}
                            </div>
                            <div className={style.documentStatus}>
                                Status: {currentDocument?.status}
                            </div>

                            <div>
                                <img src={currentDocument.downloadUrl} alt="" />
                            </div>
                            
                            <div className={style.documentMetadata}>
                                Metadados:
                                <div className={style.metadataContainer}>
                                    {
                                        currentDocument?.metadata && 
                                        Object.entries(currentDocument.metadata).map(([key, value]) => {
                                            return (
                                                <div className={style.metadata} key={key}>
                                                    {key}: {value}
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                            <div className={style.documentDownloadButton} onClick={() => {download(currentDocument)}}>
                                Download
                            </div>
                        </div>

                        {/* <iframe

                        </PDFViewer>
                        {/* <iframe
                            // src={currentDocument!.downloadUrl!}
                            src={currentDocument?.previewUrl}
                            // src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                            width="100%"
                            height="600px"
                            referrerPolicy="no-referrer"
                            itemType='application/pdf'
                        /> */}
                    </div>
                </div>
            }

        </div>
    );
}