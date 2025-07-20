import { openUploadWidget } from "../../utils/CloudinaryService";
import { Cloudinary_upload_preset } from "../../config";

const CloudinaryUpload = ({setUrl,setFileName}) => {
  const uploadImageWidget = () => {
  
    let myUploadWidget = openUploadWidget(
      {
        cloudName:"dbedqj6do",
        uploadPreset:Cloudinary_upload_preset,
        sources: ["local"],
      },
      function (error, result) {
        if (!error && result.event === "success") {
        //   props.onImageUpload(result.info.public_id);
           setUrl(result.info.secure_url);
           setFileName(result.info.original_filename);
           console.log(result.info);
        }else{
            // alert("Upload failed");
            if(error){

                console.log(error);
            }
        }
      }
    );
    myUploadWidget.open();
  };

  return (
    <button className="greenButton bg-white text-black rounded-full px-4 py-2 font-semibold" onClick={uploadImageWidget}>
      Upload Song
    </button>
  );
};

export default CloudinaryUpload;
