import { ImageIcon, SmilePlusIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Card, CardHeader, CardFooter } from "./ui/Card";
import { Input } from "./ui/Input";

export const CreatePostCard = ({ user }) => {
  return (
    <Card className="mx-auto w-[95%] mt-4 border-[#2c2c2c] border-[0.5px] rounded-2xl">
      <CardHeader className="rounded-t-2xl border-b-[0.5px] border-[#2c2c2c] p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-[60px] h-[60px]">
            <AvatarImage
              src={
                user?.avatar ||
                "https://c.animaapp.com/taiAUsBV/img/avatar@2x.png"
              }
              alt={user?.fullName || "User"}
            />
            <AvatarFallback>
              {user?.fullName ? user.fullName[0] : "T"}
            </AvatarFallback>
          </Avatar>
          <Input
            className="text-2xl border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="How are you today?"
          />
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between p-4 rounded-b-2xl border-t-[0.5px] border-[#2c2c2c]">
        <div className="flex gap-4">
          <Button variant="ghost" size="icon" className="w-10 h-10 p-0">
            <ImageIcon className="w-10 h-10" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 p-0">
            <SmilePlusIcon className="w-10 h-10" />
          </Button>
        </div>
        <Button className="rounded-2xl w-[113px] h-[58px]">Post</Button>
      </CardFooter>
    </Card>
  );
};

export default CreatePostCard;