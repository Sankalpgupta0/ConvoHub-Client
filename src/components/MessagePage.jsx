import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import Loading from './Loading';
// import backgroundImage from '../assets/wallapaper.jpeg'
import { IoMdSend } from "react-icons/io";
import moment from 'moment'
import axios from 'axios'
import { FaFilePdf } from "react-icons/fa";
import { BsUpload } from "react-icons/bs";

const MessagePage = () => {
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state => state?.user)
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
    pdfUrl: ""
  })
  const [loading, setLoading] = useState(false)
  const [allMessage, setAllMessage] = useState([])
  const currentMessage = useRef(null)
  const textareaRef = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [allMessage])

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(preve => !preve)
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    await axios.post('/api/uploadImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((res) => setMessage(preve => {
        return {
          ...preve,
          imageUrl: res.data.data.url
        }
      }))
      .catch((err) => console.log(err))


    setLoading(false)
  }

  const handleClearUploadImage = () => {
    setMessage(preve => {
      return {
        ...preve,
        imageUrl: ""
      }
    })
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const formData = new FormData()
    formData.append('video', file)
    await axios.post('/api/uploadVideo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((res) => setMessage(preve => {
        return {
          ...preve,
          videoUrl: res.data.data.url
        }
      }))
      .catch((err) => console.log(err))
    setLoading(false)
  }

  const handleClearUploadVideo = () => {
    setMessage(preve => {
      return {
        ...preve,
        videoUrl: ""
      }
    })
  }

  const handleUploadPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true)
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      await axios.post('/api/uploadPDF', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then((res) => setMessage(preve => {
          // console.log(res.data.data)
          return {
            ...preve,
            pdfUrl: res.data.data.url
          }
        }))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  }

  const handleClearUploadPDF = () => {
    setMessage(preve => {
      return {
        ...preve,
        pdfUrl: ""
      }
    })
  }

  const handleDownloadPDF = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'
    link.click();
  }

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId)

      socketConnection.emit('seen', params.userId)

      socketConnection.on('message-user', (data) => {
        setDataUser(data)
      })

      socketConnection.on('message', (data) => {
        // console.log('message data', data)
        setAllMessage(data)
      })


    }
  }, [socketConnection, params?.userId, user])

  const handleOnChange = (e) => {
    const { name, value } = e.target

    setMessage(preve => {
      return {
        ...preve,
        text: value
      }
    })
    adjustTextareaHeight();
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to auto to calculate the new scroll height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scroll height
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (message.text || message.imageUrl || message.videoUrl || message.pdfUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          pdfUrl: message.pdfUrl,
          msgByUserId: user?._id
        })
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
          pdfUrl: ""
        })
      }
    }
  }

  useEffect(() => {
    adjustTextareaHeight(); // Adjust height initially
  }, [message.text]);


  return (
    <div style={{ backgroundImage: `url(./wallapaper.jpeg)` }} className='bg-no-repeat bg-cover'>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>
              {
                dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>
              }
            </p>
          </div>
        </div>

        <div >
          <button className='cursor-pointer hover:text-primary'>
            <HiDotsVertical />
          </button>
        </div>
      </header>

      {/***show all message */}
      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>


        {/**all message show here */}
        <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
          {
            allMessage.map((msg, index) => {
              return (
                <div key={msg._id} className={` p-1 py-1 rounded w-fit max-w-[500px] max-md:max-w-[300px] md:max-w-sm  lg:max-w-md ${user._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"}`}>
                  <div className='w-full relative'>
                    {
                      msg?.imageUrl && (
                        <img
                          src={msg?.imageUrl}
                          className='w-full h-full object-scale-down'
                        />
                      )
                    }
                    {
                      msg?.videoUrl && (
                        <video
                          src={msg.videoUrl}
                          className='w-full h-full object-scale-down'
                          controls
                        />
                      )
                    }
                    {
                      msg?.pdfUrl && (
                        <label htmlFor="downloadPDF" className='flex justify-between'>
                          <FaFilePdf size={30} />
                          <button onClick={() => handleDownloadPDF(msg.pdfUrl)}>
                            <BsUpload size={20}/>
                          </button>
                        </label>

                      )
                    }
                  </div>
                  <p className='px-2 textOverflowHor'>{msg.text}</p>
                  <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
                </div>
              )
            })
          }
        </div>


        {/**upload Image display */}
        {
          message.imageUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <img
                  src={message.imageUrl}
                  alt='uploadImage'
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                />
              </div>
            </div>
          )
        }

        {/**upload video display */}
        {
          message.videoUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <video
                  src={message.videoUrl}
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                  controls
                  muted
                  autoPlay
                />
              </div>
            </div>
          )
        }

        {
          message.pdfUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadPDF}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <FaFilePdf size={100}
                  className='w-full h-full'
                />
              </div>
            </div>
          )
        }

        {
          loading && (
            <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
              <Loading />
            </div>
          )
        }
      </section>

      {/**send message */}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative '>
          <button onClick={handleUploadImageVideoOpen} className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white'>
            <FaPlus size={20} />
          </button>

          {/**video and image */}
          {
            openImageVideoUpload && (
              <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
                <form>
                  <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                    <div className='text-primary'>
                      <FaImage size={18} />
                    </div>
                    <p>Image</p>
                  </label>
                  <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                    <div className='text-purple-500'>
                      <FaVideo size={18} />
                    </div>
                    <p>Video</p>
                  </label>
                  <label htmlFor='uploadPDF' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                    <div className='text-green-500'>
                      <FaFilePdf size={18} />
                    </div>
                    <p>PDF</p>
                  </label>

                  <input
                    type='file'
                    id='uploadImage'
                    onChange={handleUploadImage}
                    className='hidden'
                    accept='image/*'
                  />

                  <input
                    type='file'
                    id='uploadVideo'
                    onChange={handleUploadVideo}
                    className='hidden'
                    accept='video/*'
                  />

                  <input
                    type='file'
                    id='uploadPDF'
                    onChange={handleUploadPDF}
                    className='hidden'
                    accept='application/pdf'
                  />
                </form>
              </div>
            )
          }

        </div>

        {/**input box */}
        <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage} 
        onKeyDown={(e) => {
          if(e.key == 'Enter')
            handleSendMessage(e)
          }}>
          <textarea
            ref={textareaRef}
            type='text'
            placeholder='Type here message...'
            className='py-1 px-4 outline-none w-full max-h-[200px] resize-none '
            value={message.text}
            onChange={handleOnChange}
          />
          <button className='text-primary hover:text-secondary'>
            <IoMdSend size={28} />
          </button>
        </form>

      </section>



    </div>
  )
}

export default MessagePage
